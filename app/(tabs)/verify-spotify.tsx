/**
 * app/(tabs)/verify-spotify.tsx - Spotify 验证页面 V2
 * 
 * 支持两种验证方式：
 * 1. Reclaim Protocol (zkProof) - 推荐，隐私保护
 * 2. OAuth 直连 - 备用方案
 * 
 * 验证成功后可铸造分层音乐徽章 SBT
 */

import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import SpotifyVerifier, { type VerificationResult } from "../../components/SpotifyVerifier";
import SpotifyConnector from "../../components/SpotifyConnector";
import MintBadgeButton from "../../components/MintBadgeButton";
import UserBadges from "../../components/UserBadges";
import type { SpotifyTokens } from "../../lib/spotify/spotify-auth";
import { TIER, type TierLevel } from "../../lib/consensus/tier-calculator";

interface SpotifyData {
    profile: {
        display_name: string;
        email: string;
    } | null;
    topArtists: Array<{
        name: string;
        genres: string[];
        popularity: number;
    }>;
    topGenres: string[];
}

/**
 * VerifySpotifyScreen - Spotify 验证页面 V2
 */
export default function VerifySpotifyScreen() {
    // 验证方式：reclaim | oauth (默认 OAuth，因为更稳定)
    const [verifyMethod, setVerifyMethod] = useState<"reclaim" | "oauth">("oauth");

    // Reclaim 验证结果
    const [reclaimResult, setReclaimResult] = useState<VerificationResult | null>(null);

    // OAuth 验证结果
    const [oauthConnected, setOauthConnected] = useState(false);
    const [oauthData, setOauthData] = useState<SpotifyData | null>(null);

    // 铸造状态
    const [mintSuccess, setMintSuccess] = useState(false);

    // 获取当前可用的流派和等级
    const getCurrentGenres = (): string[] => {
        if (verifyMethod === "reclaim" && reclaimResult?.parsedData?.genres) {
            return reclaimResult.parsedData.genres;
        }
        if (verifyMethod === "oauth" && oauthData?.topGenres) {
            return oauthData.topGenres;
        }
        return [];
    };

    const getCurrentTier = (): TierLevel => {
        if (verifyMethod === "reclaim" && reclaimResult?.suggestedTier) {
            return reclaimResult.suggestedTier;
        }
        // OAuth 方式：根据第一个艺人的 popularity 计算
        if (verifyMethod === "oauth" && oauthData?.topArtists?.[0]?.popularity) {
            const popularity = oauthData.topArtists[0].popularity;
            if (popularity >= 80) return TIER.OG;
            if (popularity >= 50) return TIER.VETERAN;
        }
        return TIER.ENTRY;
    };

    const isVerified = verifyMethod === "reclaim"
        ? reclaimResult !== null
        : oauthConnected && oauthData !== null;

    const genres = getCurrentGenres();
    const tier = getCurrentTier();

    // Reclaim 验证完成
    const handleReclaimComplete = (result: VerificationResult) => {
        console.log("Reclaim 验证完成:", result);
        setReclaimResult(result);
    };

    // OAuth 连接完成
    const handleOAuthConnect = (data: SpotifyData, tokens: SpotifyTokens) => {
        console.log("OAuth 连接完成:", data);
        setOauthConnected(true);
        setOauthData(data);
    };

    // 用于强制刷新 UserBadges
    const [badgeRefreshKey, setBadgeRefreshKey] = useState(0);

    // 铸造成功
    const handleMintSuccess = (txHash: string, mintedGenres: number[]) => {
        console.log("铸造成功:", { txHash, mintedGenres });
        setMintSuccess(true);
        // 触发 UserBadges 刷新
        setBadgeRefreshKey(prev => prev + 1);
    };

    // 重置
    const handleReset = () => {
        setReclaimResult(null);
        setOauthConnected(false);
        setOauthData(null);
        setMintSuccess(false);
    };

    return (
        <ScrollView className="flex-1 bg-dark-50">
            <View className="px-6 pt-16 pb-8">
                {/* 页面标题 */}
                <View className="mb-6">
                    <Text className="text-white text-3xl font-bold">🎵 音乐品味</Text>
                    <Text className="text-gray-400 mt-2">
                        验证你的 Spotify，铸造分层徽章
                    </Text>
                </View>

                {/* 我的徽章 */}
                <View className="mb-6">
                    <UserBadges key={`badges-${badgeRefreshKey}`} />
                </View>

                {/* 验证方式选择 */}
                {!isVerified && !mintSuccess && (
                    <View className="bg-dark-200 rounded-xl p-4 mb-6">
                        <Text className="text-gray-400 text-sm mb-3">选择验证方式</Text>
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => setVerifyMethod("reclaim")}
                                className={`flex-1 py-3 rounded-lg ${verifyMethod === "reclaim" ? "bg-primary-600" : "bg-dark-50"}`}
                            >
                                <Text className={`text-center font-medium ${verifyMethod === "reclaim" ? "text-white" : "text-gray-400"}`}>
                                    🔒 Reclaim (推荐)
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setVerifyMethod("oauth")}
                                className={`flex-1 py-3 rounded-lg ${verifyMethod === "oauth" ? "bg-primary-600" : "bg-dark-50"}`}
                            >
                                <Text className={`text-center font-medium ${verifyMethod === "oauth" ? "text-white" : "text-gray-400"}`}>
                                    🔗 OAuth
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* 验证组件 */}
                {!isVerified && !mintSuccess && (
                    <View className="mb-6">
                        {verifyMethod === "reclaim" ? (
                            <SpotifyVerifier
                                onVerificationComplete={handleReclaimComplete}
                                onError={(err) => console.error("Reclaim 错误:", err)}
                            />
                        ) : (
                            <SpotifyConnector
                                onConnect={handleOAuthConnect}
                                onDisconnect={handleReset}
                            />
                        )}
                    </View>
                )}

                {/* 验证成功后显示铸造按钮 */}
                {isVerified && genres.length > 0 && !mintSuccess && (
                    <View className="mb-6">
                        <View className="bg-dark-200 rounded-xl p-4 mb-4">
                            <Text className="text-gray-400 text-sm mb-2">
                                检测到你的音乐流派：
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {genres.slice(0, 5).map((genre, index) => (
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

                        <MintBadgeButton
                            genres={genres}
                            suggestedTier={tier}
                            onSuccess={handleMintSuccess}
                            onError={(error) => console.error("铸造失败:", error)}
                        />

                        <Pressable onPress={handleReset} className="mt-4">
                            <Text className="text-gray-500 text-center text-sm">
                                重新验证
                            </Text>
                        </Pressable>
                    </View>
                )}

                {/* 铸造成功 */}
                {mintSuccess && (
                    <View className="bg-green-900/30 rounded-2xl p-6 border border-green-700/50 mb-6">
                        <Text className="text-green-400 text-lg font-semibold mb-2">
                            🎉 恭喜！
                        </Text>
                        <Text className="text-gray-300 leading-5">
                            你的音乐徽章已铸造成功！
                            {"\n"}
                            这是一个灵魂绑定代币 (SBT)，无法转让，永久属于你。
                            {"\n\n"}
                            徽章有效期 90 天，届时需要重新验证。
                        </Text>
                        <Pressable
                            onPress={handleReset}
                            className="mt-4 py-2 rounded-lg bg-dark-50"
                        >
                            <Text className="text-gray-400 text-center">继续验证其他流派</Text>
                        </Pressable>
                    </View>
                )}

                {/* 隐私说明 */}
                <View className="bg-dark-200/50 rounded-xl p-4">
                    <Text className="text-gray-500 text-xs text-center leading-4">
                        🔒 使用 Reclaim 方式验证时，你的登录凭证不会被泄露。
                        {"\n"}
                        徽章分为 🌱入门 ⭐资深 👑OG 三个等级，由热度指数决定。
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
