/**
 * components/SpotifyVerifier.tsx - Spotify 音乐品味验证组件 V2
 * 
 * 使用 Reclaim Protocol 验证用户的 Spotify 听歌数据，
 * 并将验证与用户的钱包地址绑定，防止重放攻击。
 * 
 * V2 新增：
 * - 根据 popularity 计算品味浓度等级 (Tier)
 * - 显示等级信息供后续铸造使用
 */

import { useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, Linking } from "react-native";
import { ReclaimProofRequest, type Proof } from "@reclaimprotocol/reactnative-sdk";
import { usePrivyUnified, useEmbeddedWalletUnified } from "../hooks/usePrivyUnified";
import {
    getReclaimAppId,
    getReclaimAppSecret,
    getSpotifyProviderId,
} from "../lib/web3/reclaim-config";
import {
    calculateTierFromPopularity,
    getTierInfo,
    TIER,
    type TierLevel,
} from "../lib/consensus/tier-calculator";

// ============================================
// 类型定义
// ============================================

/** 验证状态 */
type VerificationStatus = "idle" | "verifying" | "verified" | "error";

/** Spotify 艺人数据 */
interface SpotifyArtist {
    name: string;
    genres: string[];
    popularity: number;
}

/** 流派与其 Tier */
interface GenreWithTier {
    genre: string;
    tier: TierLevel;
    popularity: number;
}

/** 解析后的证明数据 V2 */
interface ParsedProofData {
    topArtist: SpotifyArtist | null;
    genres: string[];
    genresWithTiers: GenreWithTier[];  // V2: 包含 tier 信息
    averagePopularity: number;         // V2: 平均热度
    rawContext: Record<string, unknown>;
}

/** 验证结果 V2 */
interface VerificationResult {
    proof: Proof | null;
    parsedData: ParsedProofData | null;
    walletAddress: string;
    timestamp: number;
    suggestedTier: TierLevel;  // V2: 建议的整体等级
}

/** 组件 Props */
interface SpotifyVerifierProps {
    onVerificationComplete?: (result: VerificationResult) => void;
    onError?: (error: Error) => void;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 解析 Reclaim 证明数据 V2
 * 从 proof.claimData.context 中提取 Spotify 数据并计算 Tier
 */
function parseProofData(proof: Proof): ParsedProofData {
    const result: ParsedProofData = {
        topArtist: null,
        genres: [],
        genresWithTiers: [],
        averagePopularity: 0,
        rawContext: {},
    };

    try {
        // 尝试解析 context JSON
        if (proof.claimData?.context) {
            const contextData = JSON.parse(proof.claimData.context);
            result.rawContext = contextData;

            let totalPopularity = 0;
            let popularityCount = 0;

            // 尝试提取艺人数据 (结构可能因 Provider 而异)
            if (contextData.extractedParameters) {
                const params = contextData.extractedParameters;

                // 查找艺人名称和热度
                const artistPopularity = parseInt(params.popularity) || 0;

                if (params.artistName || params.name) {
                    result.topArtist = {
                        name: params.artistName || params.name || "Unknown Artist",
                        genres: params.genres ? params.genres.split(",") : [],
                        popularity: artistPopularity,
                    };

                    if (artistPopularity > 0) {
                        totalPopularity += artistPopularity;
                        popularityCount++;
                    }
                }

                // 提取流派并计算各自的 Tier
                if (params.genres) {
                    const genreList = params.genres.split(",").map((g: string) => g.trim());
                    result.genres = genreList;

                    // 为每个流派计算 Tier (使用艺人 popularity 作为基准)
                    result.genresWithTiers = genreList.map((genre: string) => ({
                        genre,
                        tier: calculateTierFromPopularity(artistPopularity),
                        popularity: artistPopularity,
                    }));
                }
            }

            // 计算平均热度
            if (popularityCount > 0) {
                result.averagePopularity = Math.round(totalPopularity / popularityCount);
            }

            // 备用：直接从 parameters 提取
            if (proof.claimData?.parameters) {
                try {
                    const parameters = JSON.parse(proof.claimData.parameters);
                    console.log("Proof parameters:", parameters);
                } catch {
                    // 忽略解析错误
                }
            }
        }
    } catch (error) {
        console.error("解析证明数据失败:", error);
    }

    return result;
}

/**
 * 根据解析数据计算建议的整体 Tier
 */
function calculateSuggestedTier(parsedData: ParsedProofData): TierLevel {
    if (parsedData.averagePopularity > 0) {
        return calculateTierFromPopularity(parsedData.averagePopularity);
    }

    if (parsedData.topArtist && parsedData.topArtist.popularity > 0) {
        return calculateTierFromPopularity(parsedData.topArtist.popularity);
    }

    // 默认入门
    return TIER.ENTRY;
}

// ============================================
// SpotifyVerifier 组件
// ============================================

export default function SpotifyVerifier({
    onVerificationComplete,
    onError,
}: SpotifyVerifierProps) {
    // 状态
    const [status, setStatus] = useState<VerificationStatus>("idle");
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Privy hooks
    const { user } = usePrivyUnified();
    const wallet = useEmbeddedWalletUnified();

    // 获取钱包地址
    const walletAddress = wallet.status === "connected" && wallet.account
        ? wallet.account.address
        : "";

    /**
     * 开始验证流程
     * 
     * 核心步骤：
     * 1. 初始化 ReclaimProofRequest
     * 2. 使用 addContext 绑定钱包地址（防止重放攻击）
     * 3. 启动验证会话
     * 4. 解析返回的证明数据并计算 Tier
     */
    const startVerification = useCallback(async () => {
        const appId = getReclaimAppId();
        const appSecret = getReclaimAppSecret();
        const providerId = getSpotifyProviderId();

        // 检查配置
        if (!appId || !appSecret || !providerId) {
            setStatus("error");
            setErrorMessage("Reclaim 配置不完整");
            return;
        }

        // 检查钱包
        if (!walletAddress) {
            setStatus("error");
            setErrorMessage("请先连接钱包");
            return;
        }

        try {
            setStatus("verifying");
            setErrorMessage(null);

            console.log("=== 开始 Spotify 验证 (V2) ===");
            console.log("钱包地址:", walletAddress);
            console.log("Provider ID:", providerId);

            // 1. 初始化验证请求
            const proofRequest = await ReclaimProofRequest.init(
                appId,
                appSecret,
                providerId
            );

            // 2. 关键：添加钱包地址作为 Context
            proofRequest.addContext(walletAddress, "VibeConsensus Music Verification V2");

            console.log("已添加钱包地址到 Context");

            // 3. 获取验证 URL
            const requestUrl = await proofRequest.getRequestUrl();
            console.log("验证 URL:", requestUrl);

            // 4. 启动验证会话
            await proofRequest.startSession({
                onSuccess: (proofData: string | Proof | Proof[]) => {
                    console.log("验证成功！");

                    // 处理不同类型的返回值
                    let proof: Proof;
                    if (typeof proofData === "string") {
                        proof = JSON.parse(proofData);
                    } else if (Array.isArray(proofData)) {
                        proof = proofData[0];
                    } else {
                        proof = proofData;
                    }

                    // 解析证明数据
                    const parsedData = parseProofData(proof);
                    const suggestedTier = calculateSuggestedTier(parsedData);

                    console.log("解析后数据:", parsedData);
                    console.log("建议等级:", suggestedTier);

                    // 构建结果
                    const verificationResult: VerificationResult = {
                        proof,
                        parsedData,
                        walletAddress,
                        timestamp: Date.now(),
                        suggestedTier,
                    };

                    setResult(verificationResult);
                    setStatus("verified");

                    // 回调
                    onVerificationComplete?.(verificationResult);
                },
                onError: (error: Error) => {
                    console.error("验证失败:", error);
                    setStatus("error");
                    setErrorMessage(error.message || "验证过程出错");
                    onError?.(error);
                },
            });

            // 5. 打开验证链接
            await Linking.openURL(requestUrl);

        } catch (error) {
            console.error("验证初始化失败:", error);
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "未知错误");
            onError?.(error instanceof Error ? error : new Error("未知错误"));
        }
    }, [walletAddress, onVerificationComplete, onError]);

    /**
     * 重置验证状态
     */
    const resetVerification = useCallback(() => {
        setStatus("idle");
        setResult(null);
        setErrorMessage(null);
    }, []);

    // ============================================
    // 渲染
    // ============================================

    return (
        <View className="bg-dark-200 rounded-2xl overflow-hidden">
            {/* 卡片头部 */}
            <View className="p-6 border-b border-dark-50/50">
                <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">🎵</Text>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">
                            音乐品味验证
                        </Text>
                        <Text className="text-gray-400 text-sm">
                            用 zkProof 证明你的 Spotify 听歌数据
                        </Text>
                    </View>

                    {/* 状态指示器 */}
                    {status === "verified" && (
                        <View className="bg-green-600 w-8 h-8 rounded-full items-center justify-center">
                            <Text className="text-white text-sm">✓</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 卡片内容 */}
            <View className="p-6">
                {/* 未验证状态 */}
                {status === "idle" && (
                    <View>
                        <Text className="text-gray-400 mb-4 leading-5">
                            点击下方按钮，在 Reclaim 中验证你的 Spotify 账户。
                            验证将与你的钱包地址绑定。
                        </Text>

                        {walletAddress ? (
                            <View className="bg-dark-50 rounded-lg p-3 mb-4">
                                <Text className="text-gray-500 text-xs mb-1">绑定钱包</Text>
                                <Text className="text-primary-400 font-mono text-xs" numberOfLines={1}>
                                    {walletAddress}
                                </Text>
                            </View>
                        ) : (
                            <View className="bg-yellow-900/30 rounded-lg p-3 mb-4 border border-yellow-700/50">
                                <Text className="text-yellow-400 text-sm">
                                    ⚠️ 请先在主页确认钱包已创建
                                </Text>
                            </View>
                        )}

                        <Pressable
                            onPress={startVerification}
                            disabled={!walletAddress}
                            className={`py-4 rounded-xl ${walletAddress ? "bg-green-600" : "bg-gray-700"
                                }`}
                            style={({ pressed }) => [
                                {
                                    transform: [{ scale: pressed ? 0.98 : 1 }],
                                },
                            ]}
                        >
                            <View className="flex-row items-center justify-center">
                                <Text className="text-2xl mr-2">🎧</Text>
                                <Text className="text-white font-semibold text-lg">
                                    验证 Spotify
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                )}

                {/* 验证中状态 */}
                {status === "verifying" && (
                    <View className="items-center py-6">
                        <ActivityIndicator size="large" color="#22c55e" />
                        <Text className="text-white mt-4 text-lg">验证中...</Text>
                        <Text className="text-gray-400 mt-2 text-center">
                            请在打开的浏览器中完成 Spotify 登录
                        </Text>
                    </View>
                )}

                {/* 已验证状态 */}
                {status === "verified" && result && (
                    <View>
                        {/* 成功提示 */}
                        <View className="bg-green-900/30 rounded-xl p-4 mb-4 border border-green-700/50">
                            <Text className="text-green-400 font-semibold text-lg mb-2">
                                ✅ 验证成功
                            </Text>
                            <Text className="text-gray-300 text-sm">
                                你的音乐品味已通过零知识证明验证
                            </Text>
                        </View>

                        {/* V2: 品味浓度等级 */}
                        {result.suggestedTier && (
                            <View
                                className="rounded-xl p-4 mb-4 border"
                                style={{
                                    backgroundColor: `${getTierInfo(result.suggestedTier).glowColor}`,
                                    borderColor: getTierInfo(result.suggestedTier).color,
                                }}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-gray-400 text-sm mb-1">品味浓度等级</Text>
                                        <View className="flex-row items-center">
                                            <Text className="text-2xl mr-2">
                                                {getTierInfo(result.suggestedTier).emoji}
                                            </Text>
                                            <Text
                                                className="text-2xl font-bold"
                                                style={{ color: getTierInfo(result.suggestedTier).color }}
                                            >
                                                {getTierInfo(result.suggestedTier).name}
                                            </Text>
                                        </View>
                                    </View>
                                    {result.parsedData && result.parsedData.averagePopularity > 0 && (
                                        <View className="items-end">
                                            <Text className="text-gray-500 text-xs">热度指数</Text>
                                            <Text className="text-white text-xl font-bold">
                                                {result.parsedData.averagePopularity}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-gray-400 text-sm mt-2">
                                    {getTierInfo(result.suggestedTier).description}
                                </Text>
                            </View>
                        )}

                        {/* 流派标签 */}
                        {result.parsedData?.genres && result.parsedData.genres.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-400 text-sm mb-2">流派标签</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {result.parsedData.genres.slice(0, 5).map((genre, index) => (
                                        <View
                                            key={index}
                                            className="bg-primary-900/50 px-3 py-1 rounded-full border border-primary-700/50"
                                        >
                                            <Text className="text-primary-400 text-sm capitalize">
                                                {genre}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* 本命艺人 */}
                        {result.parsedData?.topArtist && (
                            <View className="bg-dark-50 rounded-xl p-4 mb-4">
                                <Text className="text-gray-400 text-sm mb-1">本命艺人</Text>
                                <Text className="text-white text-xl font-bold">
                                    {result.parsedData.topArtist.name}
                                </Text>
                                {result.parsedData.topArtist.popularity > 0 && (
                                    <Text className="text-gray-500 text-sm mt-1">
                                        热度: {result.parsedData.topArtist.popularity}
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* 绑定信息 */}
                        <View className="bg-dark-50 rounded-lg p-3">
                            <Text className="text-gray-500 text-xs mb-1">验证绑定到</Text>
                            <Text className="text-primary-400 font-mono text-xs" numberOfLines={1}>
                                {result.walletAddress}
                            </Text>
                        </View>

                        {/* 重新验证按钮 */}
                        <Pressable
                            onPress={resetVerification}
                            className="mt-4 py-3 rounded-xl bg-dark-50"
                        >
                            <Text className="text-gray-400 text-center">重新验证</Text>
                        </Pressable>
                    </View>
                )}

                {/* 错误状态 */}
                {status === "error" && (
                    <View>
                        <View className="bg-red-900/30 rounded-xl p-4 mb-4 border border-red-700/50">
                            <Text className="text-red-400 font-semibold mb-2">
                                ❌ 验证失败
                            </Text>
                            <Text className="text-gray-300 text-sm">
                                {errorMessage || "未知错误"}
                            </Text>
                        </View>

                        <Pressable
                            onPress={resetVerification}
                            className="py-3 rounded-xl bg-primary-600"
                        >
                            <Text className="text-white text-center font-semibold">
                                重试
                            </Text>
                        </Pressable>
                    </View>
                )}
            </View>

            {/* 隐私说明 */}
            <View className="px-6 pb-6">
                <Text className="text-gray-600 text-xs text-center">
                    🔒 验证使用零知识证明，你的登录凭证不会被泄露
                </Text>
            </View>
        </View>
    );
}

// 导出类型供其他组件使用
export type { VerificationResult, ParsedProofData, GenreWithTier };
