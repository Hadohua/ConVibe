/**
 * hooks/useMintSBT.ts - SBT 铸造 Hook
 * 
 * 使用 Privy 嵌入式钱包调用 MusicConsensusSBT 合约铸造徽章
 * 使用 encodeFunctionData + Privy sendTransaction 方式
 */

import { useState, useCallback } from "react";
import { usePrivy, useEmbeddedWallet } from "@privy-io/expo";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import {
    publicClient,
    MUSIC_CONSENSUS_SBT_ADDRESS,
    FAUCET_URL,
} from "../lib/web3/client";
import { MusicConsensusSBTAbi, getGenreIds } from "../lib/web3/abi";

// ============================================
// 类型定义
// ============================================

export type MintStatus =
    | "idle"
    | "checking"
    | "insufficient-gas"
    | "minting"
    | "success"
    | "error";

export interface MintResult {
    status: MintStatus;
    txHash?: string;
    error?: string;
    mintedGenres?: number[];
}

export interface UseMintSBTReturn {
    status: MintStatus;
    txHash: string | null;
    error: string | null;
    mintedGenres: number[];
    faucetUrl: string;
    mint: (genres: string[]) => Promise<MintResult>;
    checkBalance: () => Promise<string>;
    getUserBadges: () => Promise<number[]>;
    reset: () => void;
}

// ============================================
// 最低 Gas 阈值
// ============================================

const MIN_GAS_BALANCE = parseEther("0.0001"); // 0.0001 ETH

// Base Sepolia Chain ID
const BASE_SEPOLIA_CHAIN_ID = 84532;

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
     * 获取用户已有的徽章
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

            return badges as number[];
        } catch (err) {
            console.error("获取徽章失败:", err);
            return [];
        }
    }, [wallet.account?.address]);

    /**
     * 铸造 SBT 徽章
     */
    const mint = useCallback(
        async (genres: string[]): Promise<MintResult> => {
            try {
                // 检查钱包状态
                if (!wallet.account?.address) {
                    throw new Error("钱包未连接");
                }

                if (wallet.status !== "connected") {
                    throw new Error("钱包未就绪");
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

                // 转换流派为 ID
                const genreIds = getGenreIds(genres);

                if (genreIds.length === 0) {
                    throw new Error("没有可铸造的流派");
                }

                // 检查哪些徽章还没有
                const existingBadges = await getUserBadges();
                const newGenreIds = genreIds.filter((id) => !existingBadges.includes(id));

                if (newGenreIds.length === 0) {
                    setStatus("success");
                    setMintedGenres(genreIds);
                    return {
                        status: "success",
                        mintedGenres: genreIds,
                    };
                }

                setStatus("minting");

                // 获取 provider
                const provider = await wallet.getProvider();

                // 使用 viem encodeFunctionData 编码调用数据
                let data: `0x${string}`;

                if (newGenreIds.length === 1) {
                    // 单个铸造
                    data = encodeFunctionData({
                        abi: MusicConsensusSBTAbi,
                        functionName: "mintBadge",
                        args: [userAddress, BigInt(newGenreIds[0]), "0x" as `0x${string}`],
                    });
                } else {
                    // 批量铸造
                    data = encodeFunctionData({
                        abi: MusicConsensusSBTAbi,
                        functionName: "mintBatchBadges",
                        args: [userAddress, newGenreIds.map(BigInt), "0x" as `0x${string}`],
                    });
                }

                // 先切换到 Base Sepolia 网络
                try {
                    await provider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x14a34" }], // 84532 in hex
                    });
                } catch (switchError: any) {
                    // 如果网络不存在，添加网络
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

                // 估算 gas
                const gasEstimate = await publicClient.estimateGas({
                    account: userAddress,
                    to: MUSIC_CONSENSUS_SBT_ADDRESS,
                    data: data,
                });

                // 获取当前 gas 价格
                const gasPrice = await publicClient.getGasPrice();

                // 使用 eth_sendTransaction 发送交易（增加 20% gas 缓冲）
                const hash = await provider.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: userAddress,
                        to: MUSIC_CONSENSUS_SBT_ADDRESS,
                        data: data,
                        gas: `0x${((gasEstimate * 120n) / 100n).toString(16)}`,
                        gasPrice: `0x${gasPrice.toString(16)}`,
                    }],
                }) as `0x${string}`;
                setTxHash(hash);

                // 等待交易确认
                const receipt = await publicClient.waitForTransactionReceipt({ hash });

                if (receipt.status === "success") {
                    setStatus("success");
                    setMintedGenres(newGenreIds);
                    return {
                        status: "success",
                        txHash: hash,
                        mintedGenres: newGenreIds,
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
        [wallet, getUserBadges]
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
        mint,
        checkBalance,
        getUserBadges,
        reset,
    };
}
