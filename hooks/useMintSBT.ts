/**
 * hooks/useMintSBT.ts - SBT 铸造 Hook V3
 * 
 * 使用 Privy 嵌入式钱包调用 MusicConsensusSBT 合约铸造分层徽章
 * 
 * V3 新增：
 * - mintWithCVIB: 销毁 $CVIB 铸造徽章
 * - getCVIBBalance: 获取用户 $CVIB 余额
 * - approveCVIB: 授权合约使用 $CVIB
 * - 支持 mintTieredBadge (带等级参数)
 * - 支持 refreshBadge (刷新验证)
 * - 返回徽章详细信息包含等级和状态
 */

import { useState, useCallback } from "react";
import { usePrivy, useEmbeddedWallet } from "@privy-io/expo";
import { encodeFunctionData, formatEther, parseEther, toHex } from "viem";
import type { Proof } from "@reclaimprotocol/reactnative-sdk";
import {
    publicClient,
    MUSIC_CONSENSUS_SBT_ADDRESS,
    VIBE_TOKEN_ADDRESS,
    FAUCET_URL,
} from "../lib/web3/client";
import { MusicConsensusSBTAbi, VibeTokenAbi, getGenreIds, TIER } from "../lib/web3/abi";
import { type TierLevel, CVIB_TIER_COST } from "../lib/consensus/tier-calculator";

// ============================================
// 类型定义
// ============================================

export type MintStatus =
    | "idle"
    | "checking"
    | "insufficient-gas"
    | "insufficient-cvib"
    | "approving"
    | "minting"
    | "success"
    | "error";

export interface MintResult {
    status: MintStatus;
    txHash?: string;
    error?: string;
    mintedGenres?: number[];
    mintedTiers?: number[];
}

/** 徽章详细信息 */
export interface BadgeDetails {
    genreId: number;
    tier: number;
    isActive: boolean;
    lastVerified: number;
    isExpired: boolean;
}

export interface UseMintSBTReturn {
    status: MintStatus;
    txHash: string | null;
    error: string | null;
    mintedGenres: number[];
    faucetUrl: string;
    cvibBalance: string | null;
    mint: (genres: string[], tier?: TierLevel, proof?: Proof) => Promise<MintResult>;
    mintTiered: (genreIds: number[], tiers: number[]) => Promise<MintResult>;
    mintWithProof: (genreIds: number[], tiers: number[], proof: Proof) => Promise<MintResult>;
    mintWithCVIB: (genreIds: number[], tiers: number[]) => Promise<MintResult>;
    refreshBadge: (genreId: number, newTier: TierLevel) => Promise<MintResult>;
    checkBalance: () => Promise<string>;
    getCVIBBalance: () => Promise<string>;
    getUserBadges: () => Promise<number[]>;
    getUserBadgesWithDetails: () => Promise<BadgeDetails[]>;
    reset: () => void;
}

// ============================================
// 最低 Gas 阈值
// ============================================

const MIN_GAS_BALANCE = parseEther("0.0001"); // 0.0001 ETH

// Base Sepolia Chain ID
const BASE_SEPOLIA_CHAIN_ID = 84532;

// ============================================
// Proof 转换辅助函数
// ============================================

/**
 * 将 Reclaim Proof 转换为合约所需的格式
 */
function transformProofForContract(proof: Proof) {
    // 解析 context 获取 contextAddress 和 contextMessage
    let contextAddress = "";
    let contextMessage = "";
    try {
        if (proof.claimData?.context) {
            const contextData = JSON.parse(proof.claimData.context);
            contextAddress = contextData.contextAddress || "";
            contextMessage = contextData.contextMessage || "";
        }
    } catch {
        console.warn("Failed to parse proof context");
    }

    return {
        claimInfo: {
            provider: proof.claimData?.provider || "",
            parameters: proof.claimData?.parameters || "",
            context: proof.claimData?.context || "",
        },
        signedClaim: {
            claim: {
                identifier: proof.identifier as `0x${string}`,
                owner: (proof.claimData?.owner || "0x0000000000000000000000000000000000000000") as `0x${string}`,
                timestampS: proof.claimData?.timestampS || 0,
                epoch: proof.claimData?.epoch || 0,
            },
            signatures: proof.signatures?.map(sig => sig as `0x${string}`) || [],
        },
    };
}

// ============================================
// useMintSBT Hook
// ============================================

export function useMintSBT(): UseMintSBTReturn {
    const { user } = usePrivy();
    const wallet = useEmbeddedWallet();

    const [status, setStatus] = useState<MintStatus>("idle");
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mintedGenres, setMintedGenres] = useState<number[]>([]);
    const [cvibBalance, setCvibBalance] = useState<string | null>(null);

    /**
     * 获取用户钱包余额
     */
    const checkBalance = useCallback(async (): Promise<string> => {
        if (!wallet.account?.address) {
            throw new Error("钱包未连接");
        }

        const balance = await publicClient.getBalance({
            address: wallet.account.address as `0x${string}`,
        });

        return formatEther(balance);
    }, [wallet.account?.address]);

    /**
     * 获取用户 $CVIB 余额
     */
    const getCVIBBalance = useCallback(async (): Promise<string> => {
        if (!wallet.account?.address) {
            throw new Error("钱包未连接");
        }

        try {
            const balance = await publicClient.readContract({
                address: VIBE_TOKEN_ADDRESS,
                abi: VibeTokenAbi,
                functionName: "balanceOf",
                args: [wallet.account.address as `0x${string}`],
            });

            const formattedBalance = formatEther(balance as bigint);
            setCvibBalance(formattedBalance);
            return formattedBalance;
        } catch (err) {
            console.error("获取 $CVIB 余额失败:", err);
            return "0";
        }
    }, [wallet.account?.address]);

    /**
     * 获取用户已有的徽章 (简单版本)
     */
    const getUserBadges = useCallback(async (): Promise<number[]> => {
        if (!wallet.account?.address) {
            return [];
        }

        try {
            const badges = await publicClient.readContract({
                address: MUSIC_CONSENSUS_SBT_ADDRESS,
                abi: MusicConsensusSBTAbi,
                functionName: "getUserBadges",
                args: [wallet.account.address as `0x${string}`],
            });

            return (badges as bigint[]).map(id => Number(id));
        } catch (err) {
            console.error("获取徽章失败:", err);
            return [];
        }
    }, [wallet.account?.address]);

    /**
     * 获取用户徽章详细信息 (V2)
     */
    const getUserBadgesWithDetails = useCallback(async (): Promise<BadgeDetails[]> => {
        if (!wallet.account?.address) {
            return [];
        }

        try {
            const result = await publicClient.readContract({
                address: MUSIC_CONSENSUS_SBT_ADDRESS,
                abi: MusicConsensusSBTAbi,
                functionName: "getActiveBadgesWithInfo",
                args: [wallet.account.address as `0x${string}`],
            });

            const [genreIds, tiers, isActives] = result as [bigint[], number[], boolean[]];

            const details: BadgeDetails[] = [];

            for (let i = 0; i < genreIds.length; i++) {
                const genreId = Number(genreIds[i]);

                // 获取更多详情
                const info = await publicClient.readContract({
                    address: MUSIC_CONSENSUS_SBT_ADDRESS,
                    abi: MusicConsensusSBTAbi,
                    functionName: "getBadgeInfo",
                    args: [wallet.account.address as `0x${string}`, BigInt(genreId)],
                });

                const [tier, lastVerified, , isExpired] = info as [number, bigint, number, boolean];

                details.push({
                    genreId,
                    tier: tiers[i],
                    isActive: isActives[i],
                    lastVerified: Number(lastVerified),
                    isExpired,
                });
            }

            return details;
        } catch (err) {
            console.error("获取徽章详情失败:", err);
            return [];
        }
    }, [wallet.account?.address]);

    /**
     * 切换到 Base Sepolia 网络
     */
    const ensureNetwork = useCallback(async (provider: any) => {
        try {
            await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x14a34" }], // 84532 in hex
            });
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                await provider.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId: "0x14a34",
                        chainName: "Base Sepolia",
                        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                        rpcUrls: ["https://sepolia.base.org"],
                        blockExplorerUrls: ["https://sepolia.basescan.org"],
                    }],
                });
            }
        }
    }, []);

    /**
     * 铸造分层 SBT 徽章 (V2 核心函数)
     */
    const mintTiered = useCallback(
        async (genreIds: number[], tiers: number[]): Promise<MintResult> => {
            try {
                if (!wallet.account?.address) {
                    throw new Error("钱包未连接");
                }

                if (wallet.status !== "connected") {
                    throw new Error("钱包未就绪");
                }

                if (genreIds.length !== tiers.length) {
                    throw new Error("流派和等级数组长度不匹配");
                }

                setStatus("checking");
                setError(null);

                const userAddress = wallet.account.address as `0x${string}`;

                // 检查余额
                const balance = await publicClient.getBalance({ address: userAddress });

                if (balance < MIN_GAS_BALANCE) {
                    setStatus("insufficient-gas");
                    setError(`余额不足，请先获取测试 ETH`);
                    return {
                        status: "insufficient-gas",
                        error: "余额不足",
                    };
                }

                // 检查哪些徽章还没有
                const existingBadges = await getUserBadges();
                const newGenreIds: number[] = [];
                const newTiers: number[] = [];

                for (let i = 0; i < genreIds.length; i++) {
                    if (!existingBadges.includes(genreIds[i])) {
                        newGenreIds.push(genreIds[i]);
                        newTiers.push(tiers[i]);
                    }
                }

                if (newGenreIds.length === 0) {
                    setStatus("success");
                    setMintedGenres(genreIds);
                    return {
                        status: "success",
                        mintedGenres: genreIds,
                        mintedTiers: tiers,
                    };
                }

                setStatus("minting");

                const provider = await wallet.getProvider();
                await ensureNetwork(provider);

                // 编码调用数据
                let data: `0x${string}`;

                if (newGenreIds.length === 1) {
                    // 单个铸造
                    data = encodeFunctionData({
                        abi: MusicConsensusSBTAbi,
                        functionName: "mintTieredBadge",
                        args: [userAddress, BigInt(newGenreIds[0]), newTiers[0], "0x" as `0x${string}`],
                    });
                } else {
                    // 批量铸造
                    data = encodeFunctionData({
                        abi: MusicConsensusSBTAbi,
                        functionName: "mintBatchTieredBadges",
                        args: [userAddress, newGenreIds.map(BigInt), newTiers, "0x" as `0x${string}`],
                    });
                }

                // 估算 gas (带备用值)
                let gasLimit: bigint;
                try {
                    const gasEstimate = await publicClient.estimateGas({
                        account: userAddress,
                        to: MUSIC_CONSENSUS_SBT_ADDRESS,
                        data: data,
                    });
                    // 增加 50% 缓冲
                    gasLimit = (gasEstimate * 150n) / 100n;
                    console.log("Gas 估算:", gasEstimate, "-> 使用:", gasLimit);
                } catch (gasError) {
                    // 估算失败时使用固定值
                    console.warn("Gas 估算失败，使用固定值:", gasError);
                    gasLimit = 200000n;
                }

                // 确保 gasLimit 不为 0
                if (gasLimit === 0n) {
                    gasLimit = 200000n;
                }

                // 获取 gas 费用估算
                const feeData = await publicClient.estimateFeesPerGas();
                const maxFeePerGas = feeData.maxFeePerGas || 2000000n;
                const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 1000000n;

                console.log("Gas 费用:", {
                    gasLimit,
                    maxFeePerGas,
                    maxPriorityFeePerGas
                });

                // 发送 EIP-1559 交易
                const hash = await provider.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: userAddress,
                        to: MUSIC_CONSENSUS_SBT_ADDRESS,
                        data: data,
                        gasLimit: `0x${gasLimit.toString(16)}`,
                        maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
                        maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
                    }],
                }) as `0x${string}`;

                setTxHash(hash);

                // 等待确认
                const receipt = await publicClient.waitForTransactionReceipt({ hash });

                if (receipt.status === "success") {
                    setStatus("success");
                    setMintedGenres(newGenreIds);
                    return {
                        status: "success",
                        txHash: hash,
                        mintedGenres: newGenreIds,
                        mintedTiers: newTiers,
                    };
                } else {
                    throw new Error("交易失败");
                }
            } catch (err) {
                console.error("铸造失败:", err);
                const errorMessage = err instanceof Error ? err.message : "未知错误";
                setStatus("error");
                setError(errorMessage);
                return {
                    status: "error",
                    error: errorMessage,
                };
            }
        },
        [wallet, getUserBadges, ensureNetwork]
    );

    /**
     * V3 链上验证铸造 (使用 Reclaim Proof)
     */
    const mintWithProof = useCallback(
        async (genreIds: number[], tiers: number[], proof: Proof): Promise<MintResult> => {
            try {
                if (!wallet.account?.address) {
                    throw new Error("钱包未连接");
                }

                if (wallet.status !== "connected") {
                    throw new Error("钱包未就绪");
                }

                if (genreIds.length !== tiers.length) {
                    throw new Error("流派和等级数组长度不匹配");
                }

                setStatus("checking");
                setError(null);

                const userAddress = wallet.account.address as `0x${string}`;

                // 检查余额
                const balance = await publicClient.getBalance({ address: userAddress });

                if (balance < MIN_GAS_BALANCE) {
                    setStatus("insufficient-gas");
                    setError(`余额不足，请先获取测试 ETH`);
                    return {
                        status: "insufficient-gas",
                        error: "余额不足",
                    };
                }

                // 检查哪些徽章还没有
                const existingBadges = await getUserBadges();
                const newGenreIds: number[] = [];
                const newTiers: number[] = [];

                for (let i = 0; i < genreIds.length; i++) {
                    if (!existingBadges.includes(genreIds[i])) {
                        newGenreIds.push(genreIds[i]);
                        newTiers.push(tiers[i]);
                    }
                }

                if (newGenreIds.length === 0) {
                    setStatus("success");
                    setMintedGenres(genreIds);
                    return {
                        status: "success",
                        mintedGenres: genreIds,
                        mintedTiers: tiers,
                    };
                }

                setStatus("minting");

                const provider = await wallet.getProvider();
                await ensureNetwork(provider);

                // 转换 Proof 为合约格式
                const proofData = transformProofForContract(proof);

                console.log("Proof data for contract:", JSON.stringify(proofData, null, 2));

                // 编码调用数据
                let data: `0x${string}`;

                if (newGenreIds.length === 1) {
                    // 单个铸造
                    data = encodeFunctionData({
                        abi: MusicConsensusSBTAbi,
                        functionName: "mintWithProof",
                        args: [proofData, BigInt(newGenreIds[0]), newTiers[0]],
                    });
                } else {
                    // 批量铸造
                    data = encodeFunctionData({
                        abi: MusicConsensusSBTAbi,
                        functionName: "mintBatchWithProof",
                        args: [proofData, newGenreIds.map(BigInt), newTiers],
                    });
                }

                // 估算 gas (带备用值)
                let gasLimit: bigint;
                try {
                    const gasEstimate = await publicClient.estimateGas({
                        account: userAddress,
                        to: MUSIC_CONSENSUS_SBT_ADDRESS,
                        data: data,
                    });
                    // 增加 50% 缓冲
                    gasLimit = (gasEstimate * 150n) / 100n;
                    console.log("Gas 估算:", gasEstimate, "->", gasLimit);
                } catch (gasError) {
                    console.warn("Gas 估算失败，使用固定值:", gasError);
                    gasLimit = 300000n; // Proof 验证需要更多 gas
                }

                if (gasLimit === 0n) {
                    gasLimit = 300000n;
                }

                const feeData = await publicClient.estimateFeesPerGas();
                const maxFeePerGas = feeData.maxFeePerGas || 2000000n;
                const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 1000000n;

                console.log("Gas 费用:", { gasLimit, maxFeePerGas, maxPriorityFeePerGas });

                // 发送交易
                const hash = await provider.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: userAddress,
                        to: MUSIC_CONSENSUS_SBT_ADDRESS,
                        data: data,
                        gasLimit: `0x${gasLimit.toString(16)}`,
                        maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
                        maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
                    }],
                }) as `0x${string}`;

                setTxHash(hash);

                // 等待确认
                const receipt = await publicClient.waitForTransactionReceipt({ hash });

                if (receipt.status === "success") {
                    setStatus("success");
                    setMintedGenres(newGenreIds);
                    return {
                        status: "success",
                        txHash: hash,
                        mintedGenres: newGenreIds,
                        mintedTiers: newTiers,
                    };
                } else {
                    throw new Error("交易失败");
                }
            } catch (err) {
                console.error("链上验证铸造失败:", err);
                const errorMessage = err instanceof Error ? err.message : "未知错误";
                setStatus("error");
                setError(errorMessage);
                return {
                    status: "error",
                    error: errorMessage,
                };
            }
        },
        [wallet, getUserBadges, ensureNetwork]
    );

    /**
     * V4 $CVIB 铸造函数
     * 1. 检查 $CVIB 余额
     * 2. 授权 SBT 合约使用 $CVIB
     * 3. 调用 mintWithCVIB 铸造徽章
     */
    const mintWithCVIB = useCallback(
        async (genreIds: number[], tiers: number[]): Promise<MintResult> => {
            try {
                if (!wallet.account?.address) {
                    throw new Error("钱包未连接");
                }

                if (wallet.status !== "connected") {
                    throw new Error("钱包未就绪");
                }

                if (genreIds.length !== tiers.length) {
                    throw new Error("流派和等级数组长度不匹配");
                }

                setStatus("checking");
                setError(null);

                const userAddress = wallet.account.address as `0x${string}`;

                // 检查 ETH 余额
                const ethBalance = await publicClient.getBalance({ address: userAddress });
                if (ethBalance < MIN_GAS_BALANCE) {
                    setStatus("insufficient-gas");
                    setError("ETH 余额不足，请先获取测试 ETH");
                    return { status: "insufficient-gas", error: "ETH 余额不足" };
                }

                // 检查哪些徽章还没有
                const existingBadges = await getUserBadges();
                const newGenreIds: number[] = [];
                const newTiers: number[] = [];

                for (let i = 0; i < genreIds.length; i++) {
                    if (!existingBadges.includes(genreIds[i])) {
                        newGenreIds.push(genreIds[i]);
                        newTiers.push(tiers[i]);
                    }
                }

                if (newGenreIds.length === 0) {
                    setStatus("success");
                    setMintedGenres(genreIds);
                    return {
                        status: "success",
                        mintedGenres: genreIds,
                        mintedTiers: tiers,
                    };
                }

                // 计算所需 $CVIB 总量
                let totalCost = 0n;
                for (const tier of newTiers) {
                    const tierKey = tier as keyof typeof CVIB_TIER_COST;
                    totalCost += parseEther(String(CVIB_TIER_COST[tierKey] || 0));
                }

                // 检查 $CVIB 余额
                const cvibBalanceRaw = await publicClient.readContract({
                    address: VIBE_TOKEN_ADDRESS,
                    abi: VibeTokenAbi,
                    functionName: "balanceOf",
                    args: [userAddress],
                }) as bigint;

                if (cvibBalanceRaw < totalCost) {
                    setStatus("insufficient-cvib");
                    setError(`$CVIB 余额不足，需要 ${formatEther(totalCost)} CVIB，当前余额 ${formatEther(cvibBalanceRaw)} CVIB`);
                    return { status: "insufficient-cvib" as MintStatus, error: "$CVIB 余额不足" };
                }

                const provider = await wallet.getProvider();
                await ensureNetwork(provider);

                // 检查授权额度
                const allowance = await publicClient.readContract({
                    address: VIBE_TOKEN_ADDRESS,
                    abi: VibeTokenAbi,
                    functionName: "allowance",
                    args: [userAddress, MUSIC_CONSENSUS_SBT_ADDRESS],
                }) as bigint;

                // 如果授权不足，先授权
                if (allowance < totalCost) {
                    setStatus("approving");
                    console.log("授权 $CVB...");

                    const approveData = encodeFunctionData({
                        abi: VibeTokenAbi,
                        functionName: "approve",
                        args: [MUSIC_CONSENSUS_SBT_ADDRESS, totalCost],
                    });

                    // 估算授权 gas
                    let approveGasLimit: bigint;
                    try {
                        const gasEstimate = await publicClient.estimateGas({
                            account: userAddress,
                            to: VIBE_TOKEN_ADDRESS,
                            data: approveData,
                        });
                        approveGasLimit = (gasEstimate * 150n) / 100n;
                    } catch {
                        approveGasLimit = 60000n; // approve 操作的安全默认值
                    }

                    const feeData = await publicClient.estimateFeesPerGas();
                    const maxFeePerGas = feeData.maxFeePerGas || 2000000n;
                    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 1000000n;

                    const approveHash = await provider.request({
                        method: "eth_sendTransaction",
                        params: [{
                            from: userAddress,
                            to: VIBE_TOKEN_ADDRESS,
                            data: approveData,
                            gasLimit: `0x${approveGasLimit.toString(16)}`,
                            maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
                            maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
                        }],
                    }) as `0x${string}`;

                    console.log("等待授权确认:", approveHash);
                    await publicClient.waitForTransactionReceipt({ hash: approveHash });
                }

                setStatus("minting");

                // 逐个铸造徽章 (或批量)
                if (newGenreIds.length === 1) {
                    const mintData = encodeFunctionData({
                        abi: MusicConsensusSBTAbi,
                        functionName: "mintWithCVIB",
                        args: [BigInt(newGenreIds[0]), newTiers[0]],
                    });

                    let gasLimit: bigint;
                    try {
                        const gasEstimate = await publicClient.estimateGas({
                            account: userAddress,
                            to: MUSIC_CONSENSUS_SBT_ADDRESS,
                            data: mintData,
                        });
                        gasLimit = (gasEstimate * 150n) / 100n;
                    } catch {
                        gasLimit = 300000n;
                    }

                    const feeData = await publicClient.estimateFeesPerGas();
                    const maxFeePerGas = feeData.maxFeePerGas || 2000000n;
                    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 1000000n;

                    const hash = await provider.request({
                        method: "eth_sendTransaction",
                        params: [{
                            from: userAddress,
                            to: MUSIC_CONSENSUS_SBT_ADDRESS,
                            data: mintData,
                            gasLimit: `0x${gasLimit.toString(16)}`,
                            maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
                            maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
                        }],
                    }) as `0x${string}`;

                    setTxHash(hash);
                    const receipt = await publicClient.waitForTransactionReceipt({ hash });

                    if (receipt.status === "success") {
                        setStatus("success");
                        setMintedGenres(newGenreIds);
                        await getCVIBBalance(); // 刷新余额
                        return {
                            status: "success",
                            txHash: hash,
                            mintedGenres: newGenreIds,
                            mintedTiers: newTiers,
                        };
                    } else {
                        throw new Error("交易失败");
                    }
                } else {
                    // 批量铸造
                    const mintData = encodeFunctionData({
                        abi: MusicConsensusSBTAbi,
                        functionName: "mintBatchWithCVIB",
                        args: [newGenreIds.map(BigInt), newTiers],
                    });

                    let gasLimit: bigint;
                    try {
                        const gasEstimate = await publicClient.estimateGas({
                            account: userAddress,
                            to: MUSIC_CONSENSUS_SBT_ADDRESS,
                            data: mintData,
                        });
                        gasLimit = (gasEstimate * 150n) / 100n;
                    } catch {
                        gasLimit = 500000n;
                    }

                    const feeData = await publicClient.estimateFeesPerGas();
                    const maxFeePerGas = feeData.maxFeePerGas || 2000000n;
                    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 1000000n;

                    const hash = await provider.request({
                        method: "eth_sendTransaction",
                        params: [{
                            from: userAddress,
                            to: MUSIC_CONSENSUS_SBT_ADDRESS,
                            data: mintData,
                            gasLimit: `0x${gasLimit.toString(16)}`,
                            maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
                            maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
                        }],
                    }) as `0x${string}`;

                    setTxHash(hash);
                    const receipt = await publicClient.waitForTransactionReceipt({ hash });

                    if (receipt.status === "success") {
                        setStatus("success");
                        setMintedGenres(newGenreIds);
                        await getCVIBBalance(); // 刷新余额
                        return {
                            status: "success",
                            txHash: hash,
                            mintedGenres: newGenreIds,
                            mintedTiers: newTiers,
                        };
                    } else {
                        throw new Error("批量铸造失败");
                    }
                }
            } catch (err) {
                console.error("$CVIB 铸造失败:", err);
                const errorMessage = err instanceof Error ? err.message : "未知错误";
                setStatus("error");
                setError(errorMessage);
                return {
                    status: "error",
                    error: errorMessage,
                };
            }
        },
        [wallet, getUserBadges, ensureNetwork, getCVIBBalance]
    );

    /**
     * 通用铸造函数 (V3: 支持 Proof)
     * - 有 proof: 调用 mintWithProof (链上验证)
     * - 无 proof: 调用 mintTiered (向后兼容 OAuth/Import)
     */
    const mint = useCallback(
        async (genres: string[], tier: TierLevel = TIER.ENTRY, proof?: Proof): Promise<MintResult> => {
            const genreIds = getGenreIds(genres);

            if (genreIds.length === 0) {
                return {
                    status: "error",
                    error: "没有可铸造的流派",
                };
            }

            // 所有流派使用相同 tier
            const tiers = genreIds.map(() => tier);

            // V4: 默认使用 $CVB 铸造
            // 如果有 Proof 则使用链上验证 (mintWithProof)
            if (proof) {
                console.log("使用 Reclaim Proof 链上验证铸造");
                return mintWithProof(genreIds, tiers, proof);
            }

            // V4 默认：使用 $CVB 铸造
            console.log("使用 $CVB 铸造 (V4)");
            return mintWithCVIB(genreIds, tiers);
        },
        [mintWithCVIB, mintWithProof]
    );

    /**
     * 刷新徽章 (重新验证，更新时间戳和可能的等级)
     */
    const refreshBadge = useCallback(
        async (genreId: number, newTier: TierLevel): Promise<MintResult> => {
            try {
                if (!wallet.account?.address) {
                    throw new Error("钱包未连接");
                }

                if (wallet.status !== "connected") {
                    throw new Error("钱包未就绪");
                }

                setStatus("minting");
                setError(null);

                const userAddress = wallet.account.address as `0x${string}`;
                const provider = await wallet.getProvider();

                await ensureNetwork(provider);

                const data = encodeFunctionData({
                    abi: MusicConsensusSBTAbi,
                    functionName: "refreshBadge",
                    args: [BigInt(genreId), newTier],
                });

                // 估算 gas (带备用值)
                let gasLimit: bigint;
                try {
                    const gasEstimate = await publicClient.estimateGas({
                        account: userAddress,
                        to: MUSIC_CONSENSUS_SBT_ADDRESS,
                        data: data,
                    });
                    gasLimit = (gasEstimate * 150n) / 100n;
                } catch {
                    gasLimit = 100000n;
                }
                if (gasLimit === 0n) gasLimit = 100000n;

                const feeData = await publicClient.estimateFeesPerGas();
                const maxFeePerGas = feeData.maxFeePerGas || 2000000n;
                const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 1000000n;

                const hash = await provider.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: userAddress,
                        to: MUSIC_CONSENSUS_SBT_ADDRESS,
                        data: data,
                        gasLimit: `0x${gasLimit.toString(16)}`,
                        maxFeePerGas: `0x${maxFeePerGas.toString(16)}`,
                        maxPriorityFeePerGas: `0x${maxPriorityFeePerGas.toString(16)}`,
                    }],
                }) as `0x${string}`;

                setTxHash(hash);

                const receipt = await publicClient.waitForTransactionReceipt({ hash });

                if (receipt.status === "success") {
                    setStatus("success");
                    return {
                        status: "success",
                        txHash: hash,
                        mintedGenres: [genreId],
                        mintedTiers: [newTier],
                    };
                } else {
                    throw new Error("刷新失败");
                }
            } catch (err) {
                console.error("刷新徽章失败:", err);
                const errorMessage = err instanceof Error ? err.message : "未知错误";
                setStatus("error");
                setError(errorMessage);
                return {
                    status: "error",
                    error: errorMessage,
                };
            }
        },
        [wallet, ensureNetwork]
    );

    /**
     * 重置状态
     */
    const reset = useCallback(() => {
        setStatus("idle");
        setTxHash(null);
        setError(null);
        setMintedGenres([]);
    }, []);

    return {
        status,
        txHash,
        error,
        mintedGenres,
        faucetUrl: FAUCET_URL,
        cvibBalance,
        mint,
        mintTiered,
        mintWithProof,
        mintWithCVIB,
        refreshBadge,
        checkBalance,
        getCVIBBalance,
        getUserBadges,
        getUserBadgesWithDetails,
        reset,
    };
}
