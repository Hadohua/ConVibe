/**
 * app/(tabs)/verify-spotify.tsx - Spotify 验证页面 V3
 * 
 * 支持三种验证方式：
 * 1. OAuth 直连 - 快速便捷
 * 2. 数据导入 - 精确统计（类似 stats.fm）
 * 3. Reclaim Protocol (zkProof) - 隐私保护
 * 
 * 验证成功后可铸造分层音乐徽章 SBT
 */

import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import SpotifyVerifier, { type VerificationResult } from "../../components/SpotifyVerifier";
import SpotifyConnector from "../../components/SpotifyConnector";
import SpotifyDataImport from "../../components/SpotifyDataImport";
import SpotifyStats from "../../components/SpotifyStats";
import MintBadgeButton from "../../components/MintBadgeButton";
import UserBadges from "../../components/UserBadges";
import type { SpotifyTokens } from "../../lib/spotify/spotify-auth";
import type { StreamingStats } from "../../lib/spotify/streaming-history-parser";
import { calculateTierFromPlaytime } from "../../lib/spotify/streaming-history-parser";
import { TIER, type TierLevel } from "../../lib/consensus/tier-calculator";

// ============================================
// 可选流派列表
// ============================================

const AVAILABLE_GENRES = [
    { id: "pop", name: "Pop", emoji: "🎤" },
    { id: "rock", name: "Rock", emoji: "🎸" },
    { id: "hip-hop", name: "Hip-Hop", emoji: "🎤" },
    { id: "r&b", name: "R&B", emoji: "🎵" },
    { id: "electronic", name: "Electronic", emoji: "🎧" },
    { id: "jazz", name: "Jazz", emoji: "🎷" },
    { id: "classical", name: "Classical", emoji: "🎻" },
    { id: "country", name: "Country", emoji: "🤠" },
    { id: "indie", name: "Indie", emoji: "🌿" },
    { id: "metal", name: "Metal", emoji: "🤘" },
];

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

type VerifyMethod = "oauth" | "import" | "reclaim";

/**
 * VerifySpotifyScreen - Spotify 验证页面 V3
 */
export default function VerifySpotifyScreen() {
    // 验证方式：oauth | import | reclaim (默认 OAuth)
    const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>("oauth");

    // Reclaim 验证结果
    const [reclaimResult, setReclaimResult] = useState<VerificationResult | null>(null);

    // OAuth 验证结果
    const [oauthConnected, setOauthConnected] = useState(false);
    const [oauthData, setOauthData] = useState<SpotifyData | null>(null);

    // 数据导入结果
    const [importedStats, setImportedStats] = useState<StreamingStats | null>(null);

    // 用户选择的流派（用于数据导入方式）
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // 铸造状态
    const [mintSuccess, setMintSuccess] = useState(false);

    // 切换流派选择
    const toggleGenre = (genreId: string) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(g => g !== genreId)
                : [...prev, genreId]
        );
    };

    // 获取当前可用的流派和等级
    const getCurrentGenres = (): string[] => {
        if (verifyMethod === "reclaim" && reclaimResult?.parsedData?.genres) {
            return reclaimResult.parsedData.genres;
        }
        if (verifyMethod === "oauth" && oauthData?.topGenres) {
            return oauthData.topGenres;
        }
        // 导入方式：使用用户选择的流派
        if (verifyMethod === "import" && importedStats) {
            return selectedGenres;
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
        // 导入方式：根据 top artist 播放时长计算
        if (verifyMethod === "import" && importedStats?.topArtists?.[0]) {
            const hours = importedStats.topArtists[0].totalHours;
            return calculateTierFromPlaytime(hours);
        }
        return TIER.ENTRY;
    };

    const isVerified =
        (verifyMethod === "reclaim" && reclaimResult !== null) ||
        (verifyMethod === "oauth" && oauthConnected && oauthData !== null) ||
        (verifyMethod === "import" && importedStats !== null);

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

    // 数据导入完成
    const handleImportComplete = (stats: StreamingStats) => {
        console.log("数据导入完成:", stats);
        setImportedStats(stats);
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
        setImportedStats(null);
        setSelectedGenres([]);
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
                        <View className="flex-row flex-wrap gap-2">
                            <Pressable
                                onPress={() => setVerifyMethod("oauth")}
                                className={`flex-1 min-w-[30%] py-3 rounded-lg ${verifyMethod === "oauth" ? "bg-green-600" : "bg-dark-50"}`}
                            >
                                <Text className={`text-center font-medium text-sm ${verifyMethod === "oauth" ? "text-white" : "text-gray-400"}`}>
                                    🔗 OAuth
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setVerifyMethod("import")}
                                className={`flex-1 min-w-[30%] py-3 rounded-lg ${verifyMethod === "import" ? "bg-purple-600" : "bg-dark-50"}`}
                            >
                                <Text className={`text-center font-medium text-sm ${verifyMethod === "import" ? "text-white" : "text-gray-400"}`}>
                                    📊 导入
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setVerifyMethod("reclaim")}
                                className={`flex-1 min-w-[30%] py-3 rounded-lg ${verifyMethod === "reclaim" ? "bg-primary-600" : "bg-dark-50"}`}
                            >
                                <Text className={`text-center font-medium text-sm ${verifyMethod === "reclaim" ? "text-white" : "text-gray-400"}`}>
                                    🔒 Reclaim
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* 验证组件 */}
                {!isVerified && !mintSuccess && (
                    <View className="mb-6">
                        {verifyMethod === "oauth" && (
                            <SpotifyConnector
                                onConnect={handleOAuthConnect}
                                onDisconnect={handleReset}
                            />
                        )}
                        {verifyMethod === "import" && (
                            <SpotifyDataImport
                                onImportComplete={handleImportComplete}
                                onError={(err) => console.error("导入错误:", err)}
                            />
                        )}
                        {verifyMethod === "reclaim" && (
                            <SpotifyVerifier
                                onVerificationComplete={handleReclaimComplete}
                                onError={(err) => console.error("Reclaim 错误:", err)}
                            />
                        )}
                    </View>
                )}

                {/* 数据导入成功 - 显示统计和流派选择 */}
                {verifyMethod === "import" && importedStats && !mintSuccess && (
                    <View className="mb-6">
                        {/* 播放统计 */}
                        <View className="mb-4">
                            <SpotifyStats stats={importedStats} showFullDetails />
                        </View>

                        {/* 流派选择 */}
                        <View className="bg-dark-200 rounded-xl p-4 mb-4">
                            <Text className="text-white font-semibold mb-2">选择要铸造的流派徽章</Text>
                            <Text className="text-gray-500 text-xs mb-3">
                                基于你的播放数据，选择最能代表你音乐品味的流派（可多选）
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {AVAILABLE_GENRES.map((genre) => (
                                    <Pressable
                                        key={genre.id}
                                        onPress={() => toggleGenre(genre.id)}
                                        className={`px-4 py-2 rounded-full border ${selectedGenres.includes(genre.id)
                                            ? "bg-purple-600 border-purple-500"
                                            : "bg-dark-50 border-dark-50"
                                            }`}
                                    >
                                        <Text className={`text-sm ${selectedGenres.includes(genre.id)
                                            ? "text-white"
                                            : "text-gray-400"
                                            }`}>
                                            {genre.emoji} {genre.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* 铸造按钮 */}
                        {selectedGenres.length > 0 && (
                            <MintBadgeButton
                                genres={selectedGenres}
                                suggestedTier={tier}
                                onSuccess={handleMintSuccess}
                                onError={(error) => console.error("铸造失败:", error)}
                            />
                        )}

                        {selectedGenres.length === 0 && (
                            <View className="bg-dark-50 rounded-xl p-4">
                                <Text className="text-gray-500 text-center">请选择至少一个流派以铸造徽章</Text>
                            </View>
                        )}

                        <Pressable onPress={handleReset} className="mt-4">
                            <Text className="text-gray-500 text-center text-sm">重新导入</Text>
                        </Pressable>
                    </View>
                )}

                {/* OAuth/Reclaim 验证成功后显示铸造按钮 */}
                {isVerified && verifyMethod !== "import" && genres.length > 0 && !mintSuccess && (
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
                            proof={verifyMethod === "reclaim" ? reclaimResult?.proof ?? undefined : undefined}
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
