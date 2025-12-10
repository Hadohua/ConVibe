/**
 * app/music-vibe-detail.tsx - 音乐 Vibe 详情页 V2
 * 
 * 整合三个核心功能:
 * - 验证: 三种方式 (OAuth/Import/Reclaim)
 * - 统计: SpotifyStats
 * - 共识: ConsensusFeed
 */

import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import SpotifyVerifier, { type VerificationResult } from "../components/SpotifyVerifier";
import SpotifyConnector from "../components/SpotifyConnector";
import SpotifyDataImport from "../components/SpotifyDataImport";
import SpotifyStats from "../components/SpotifyStats";
import MintBadgeButton from "../components/MintBadgeButton";
import UserBadges from "../components/UserBadges";
import ConsensusFeed from "../components/ConsensusFeed";
import CVIBBalanceCard from "../components/CVIBBalanceCard";
import DateRangePicker from "../components/stats/DateRangePicker";
import LeaderboardList from "../components/stats/LeaderboardList";
import SyncStatusCard from "../components/stats/SyncStatusCard";
import { calculateCVIBFromStats } from "../lib/consensus/tier-calculator";
import type { StreamingStats } from "../lib/spotify/streaming-history-parser";
import type { SpotifyTokens } from "../lib/spotify/spotify-auth";
import { calculateTierFromPlaytime } from "../lib/spotify/streaming-history-parser";
import { TIER, type TierLevel } from "../lib/consensus/tier-calculator";

// ============================================
// Tab 类型定义
// ============================================

type TabType = "verify" | "stats" | "consensus";
type VerifyMethod = "oauth" | "import" | "reclaim";

interface TabItem {
    key: TabType;
    label: string;
    emoji: string;
}

const TABS: TabItem[] = [
    { key: "verify", label: "验证", emoji: "🎵" },
    { key: "stats", label: "统计", emoji: "📊" },
    { key: "consensus", label: "共识", emoji: "🔥" },
];

// 可选流派列表
const AVAILABLE_GENRES = [
    { id: "pop", name: "Pop", emoji: "🎤" },
    { id: "rock", name: "Rock", emoji: "🎸" },
    { id: "hip-hop", name: "Hip-Hop", emoji: "🎤" },
    { id: "r&b", name: "R&B", emoji: "🎵" },
    { id: "electronic", name: "Electronic", emoji: "🎧" },
];

interface SpotifyData {
    profile: { display_name: string; email: string } | null;
    topArtists: Array<{ name: string; genres: string[]; popularity: number }>;
    topGenres: string[];
}

// ============================================
// Music Vibe Detail 主组件
// ============================================

export default function MusicVibeDetail() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("verify");

    // 验证方式
    const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>("oauth");

    // 验证状态
    const [reclaimResult, setReclaimResult] = useState<VerificationResult | null>(null);
    const [oauthConnected, setOauthConnected] = useState(false);
    const [oauthData, setOauthData] = useState<SpotifyData | null>(null);
    const [importedStats, setImportedStats] = useState<StreamingStats | null>(null);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // 时间范围过滤状态
    const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
    const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);

    // 铸造状态
    const [mintSuccess, setMintSuccess] = useState(false);
    const [badgeRefreshKey, setBadgeRefreshKey] = useState(0);

    // CVIB 领取状态
    const [claiming, setClaiming] = useState(false);
    const [cvibClaimed, setCvibClaimed] = useState(false);

    // 处理 CVIB 领取 (MVP: 提示用户使用脚本)
    const handleClaimCVIB = useCallback(async () => {
        setClaiming(true);
        // TODO: 实际实现需要后端 API
        // 目前显示提示信息
        setTimeout(() => {
            setClaiming(false);
            setCvibClaimed(true);
            setBadgeRefreshKey(prev => prev + 1);
            alert('MVP 阶段: 请联系管理员使用 mint-cvib.js 脚本为你铸造 $CVB。成功后即可铸造徽章。');
        }, 1000);
    }, []);

    // 切换流派选择
    const toggleGenre = (genreId: string) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(g => g !== genreId)
                : [...prev, genreId]
        );
    };

    // 获取当前可用的流派
    const getCurrentGenres = (): string[] => {
        if (verifyMethod === "reclaim" && reclaimResult?.parsedData?.genres) {
            return reclaimResult.parsedData.genres;
        }
        if (verifyMethod === "oauth" && oauthData?.topGenres) {
            return oauthData.topGenres;
        }
        if (verifyMethod === "import" && importedStats) {
            return selectedGenres;
        }
        return [];
    };

    // 获取当前 Tier
    const getCurrentTier = (): TierLevel => {
        if (verifyMethod === "reclaim" && reclaimResult?.suggestedTier) {
            return reclaimResult.suggestedTier;
        }
        if (verifyMethod === "oauth" && oauthData?.topArtists?.[0]?.popularity) {
            const popularity = oauthData.topArtists[0].popularity;
            if (popularity >= 80) return TIER.OG;
            if (popularity >= 50) return TIER.VETERAN;
        }
        if (verifyMethod === "import" && importedStats?.topArtists?.[0]) {
            return calculateTierFromPlaytime(importedStats.topArtists[0].totalHours);
        }
        return TIER.ENTRY;
    };

    const isVerified =
        (verifyMethod === "reclaim" && reclaimResult !== null) ||
        (verifyMethod === "oauth" && oauthConnected && oauthData !== null) ||
        (verifyMethod === "import" && importedStats !== null);

    const genres = getCurrentGenres();
    const tier = getCurrentTier();

    // 处理验证完成
    const handleReclaimComplete = useCallback((result: VerificationResult) => {
        console.log("Reclaim 验证完成:", result);
        setReclaimResult(result);
    }, []);

    const handleOAuthConnect = useCallback((data: SpotifyData, tokens: SpotifyTokens) => {
        console.log("OAuth 连接完成:", data);
        setOauthConnected(true);
        setOauthData(data);
    }, []);

    const handleImportComplete = useCallback((stats: StreamingStats) => {
        console.log("导入完成:", stats);
        setImportedStats(stats);
    }, []);

    const handleMintSuccess = useCallback((txHash: string, mintedGenres: number[]) => {
        console.log("铸造成功:", { txHash, mintedGenres });
        setMintSuccess(true);
        setBadgeRefreshKey(prev => prev + 1);
    }, []);

    // 重置
    const handleReset = useCallback(() => {
        setReclaimResult(null);
        setOauthConnected(false);
        setOauthData(null);
        setImportedStats(null);
        setSelectedGenres([]);
        setMintSuccess(false);
    }, []);

    // 渲染验证 Tab
    // 计算预估可获得的 $CVIB
    const getEstimatedCVIB = (): number | undefined => {
        if (verifyMethod === "import" && importedStats) {
            const result = calculateCVIBFromStats({
                totalHours: importedStats.totalHours,
                topArtists: importedStats.topArtists,
            });
            return result.totalCVIB;
        }
        return undefined;
    };

    const renderVerifyTab = () => (
        <View style={styles.tabContent}>
            {/* $CVIB 余额卡片 */}
            <CVIBBalanceCard
                refreshKey={badgeRefreshKey}
                estimatedCVIB={isVerified ? getEstimatedCVIB() : undefined}
                showClaimButton={isVerified && !cvibClaimed}
                claiming={claiming}
                onClaimPress={handleClaimCVIB}
            />

            {/* 我的徽章 */}
            <View style={styles.badgesSection}>
                <UserBadges key={`badges-${badgeRefreshKey}`} />
            </View>

            {/* 铸造成功提示 */}
            {mintSuccess && (
                <View style={styles.successCard}>
                    <Text style={styles.successTitle}>🎉 恭喜！</Text>
                    <Text style={styles.successText}>
                        你的音乐徽章已铸造成功！这是一个灵魂绑定代币 (SBT)，无法转让，永久属于你。
                    </Text>
                    <Pressable onPress={handleReset} style={styles.continueButton}>
                        <Text style={styles.continueButtonText}>继续验证其他流派</Text>
                    </Pressable>
                </View>
            )}

            {/* 验证方式选择 */}
            {!isVerified && !mintSuccess && (
                <View style={styles.methodSelector}>
                    <Text style={styles.methodLabel}>选择验证方式</Text>
                    <View style={styles.methodButtons}>
                        <Pressable
                            onPress={() => setVerifyMethod("oauth")}
                            style={[styles.methodBtn, verifyMethod === "oauth" && styles.methodBtnActive]}
                        >
                            <Text style={[styles.methodBtnText, verifyMethod === "oauth" && styles.methodBtnTextActive]}>
                                🔗 OAuth
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setVerifyMethod("import")}
                            style={[styles.methodBtn, verifyMethod === "import" && styles.methodBtnActiveImport]}
                        >
                            <Text style={[styles.methodBtnText, verifyMethod === "import" && styles.methodBtnTextActive]}>
                                📊 导入
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setVerifyMethod("reclaim")}
                            style={[styles.methodBtn, verifyMethod === "reclaim" && styles.methodBtnActiveReclaim]}
                        >
                            <Text style={[styles.methodBtnText, verifyMethod === "reclaim" && styles.methodBtnTextActive]}>
                                🔒 Reclaim
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* 验证组件 */}
            {!isVerified && !mintSuccess && (
                <View style={styles.verifyComponent}>
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

            {/* 数据导入成功 - 显示流派选择 */}
            {verifyMethod === "import" && importedStats && !mintSuccess && (
                <View>
                    <View style={styles.genreSelector}>
                        <Text style={styles.genreSelectorTitle}>选择要铸造的流派徽章</Text>
                        <View style={styles.genreButtons}>
                            {AVAILABLE_GENRES.map((genre) => (
                                <Pressable
                                    key={genre.id}
                                    onPress={() => toggleGenre(genre.id)}
                                    style={[
                                        styles.genreBtn,
                                        selectedGenres.includes(genre.id) && styles.genreBtnActive,
                                    ]}
                                >
                                    <Text style={[
                                        styles.genreBtnText,
                                        selectedGenres.includes(genre.id) && styles.genreBtnTextActive,
                                    ]}>
                                        {genre.emoji} {genre.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {selectedGenres.length > 0 && (
                        <MintBadgeButton
                            genres={selectedGenres}
                            suggestedTier={tier}
                            onSuccess={handleMintSuccess}
                            onError={(error) => console.error("铸造失败:", error)}
                        />
                    )}
                </View>
            )}

            {/* OAuth/Reclaim 验证成功后显示铸造按钮 */}
            {isVerified && verifyMethod !== "import" && genres.length > 0 && !mintSuccess && (
                <View>
                    <View style={styles.detectedGenres}>
                        <Text style={styles.detectedGenresLabel}>检测到你的音乐流派：</Text>
                        <View style={styles.genreTags}>
                            {genres.slice(0, 5).map((genre, index) => (
                                <View key={index} style={styles.genreTag}>
                                    <Text style={styles.genreTagText}>{genre}</Text>
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

                    <Pressable onPress={handleReset} style={styles.resetButton}>
                        <Text style={styles.resetButtonText}>重新验证</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );

    // 渲染统计 Tab
    const renderStatsTab = () => {
        // 计算数据的时间范围
        const dataStartDate = importedStats?.firstStream ? new Date(importedStats.firstStream) : null;
        const dataEndDate = importedStats?.lastStream ? new Date(importedStats.lastStream) : null;

        // 日期范围变化处理
        const handleDateRangeChange = (start: Date | null, end: Date | null) => {
            setDateRangeStart(start);
            setDateRangeEnd(end);
            // TODO: 当有原始记录时，应重新过滤并生成统计
        };

        return (
            <View style={styles.tabContent}>
                {/* 有导入数据时显示完整统计 */}
                {importedStats ? (
                    <>
                        <View style={styles.dataSourceBadge}>
                            <Text style={styles.dataSourceText}>📊 数据来源: Spotify 数据导出</Text>
                        </View>

                        {/* 时间范围选择器 */}
                        <DateRangePicker
                            dataStartDate={dataStartDate}
                            dataEndDate={dataEndDate}
                            startDate={dateRangeStart}
                            endDate={dateRangeEnd}
                            onRangeChange={handleDateRangeChange}
                        />

                        {/* 实时同步状态 */}
                        <SyncStatusCard />

                        {/* 如果也有 OAuth 数据，先显示用户偏好 */}
                        {oauthData && oauthConnected && (
                            <View style={[styles.oauthStatsCard, { marginBottom: 16 }]}>
                                <Text style={styles.oauthStatsTitle}>
                                    {oauthData.profile?.display_name || '用户'} 的音乐偏好
                                </Text>
                                {/* Top 流派 */}
                                {oauthData.topGenres && oauthData.topGenres.length > 0 && (
                                    <View style={styles.oauthSection}>
                                        <Text style={styles.oauthSectionLabel}>热门流派</Text>
                                        <View style={styles.genreChips}>
                                            {oauthData.topGenres.slice(0, 5).map((genre, i) => (
                                                <View key={i} style={styles.genreChip}>
                                                    <Text style={styles.genreChipText}>{genre}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                                {/* Top 艺人 */}
                                {oauthData.topArtists && oauthData.topArtists.length > 0 && (
                                    <View style={styles.oauthSection}>
                                        <Text style={styles.oauthSectionLabel}>热门艺人</Text>
                                        {oauthData.topArtists.slice(0, 5).map((artist, i) => (
                                            <View key={i} style={styles.oauthArtistRow}>
                                                <Text style={styles.oauthArtistRank}>#{i + 1}</Text>
                                                <Text style={styles.oauthArtistName}>{artist.name}</Text>
                                                <Text style={styles.oauthArtistPop}>🔥 {artist.popularity}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        {/* 统计概览 */}
                        <SpotifyStats stats={importedStats} showFullDetails />

                        {/* 排行榜（带排序切换） */}
                        <View style={{ marginTop: 16 }}>
                            <LeaderboardList
                                topTracks={importedStats.topTracks}
                                topArtists={importedStats.topArtists}
                                limit={15}
                            />
                        </View>
                    </>
                ) : oauthData && oauthConnected ? (
                    /* OAuth 连接但未导入时显示简要数据 */
                    <>
                        <View style={styles.dataSourceBadge}>
                            <Text style={styles.dataSourceText}>🔗 数据来源: Spotify OAuth</Text>
                        </View>
                        <View style={styles.oauthStatsCard}>
                            <Text style={styles.oauthStatsTitle}>
                                {oauthData.profile?.display_name || '用户'} 的音乐偏好
                            </Text>

                            {/* Top 流派 */}
                            {oauthData.topGenres && oauthData.topGenres.length > 0 && (
                                <View style={styles.oauthSection}>
                                    <Text style={styles.oauthSectionLabel}>热门流派</Text>
                                    <View style={styles.genreChips}>
                                        {oauthData.topGenres.slice(0, 5).map((genre, i) => (
                                            <View key={i} style={styles.genreChip}>
                                                <Text style={styles.genreChipText}>{genre}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Top 艺人 */}
                            {oauthData.topArtists && oauthData.topArtists.length > 0 && (
                                <View style={styles.oauthSection}>
                                    <Text style={styles.oauthSectionLabel}>热门艺人</Text>
                                    {oauthData.topArtists.slice(0, 5).map((artist, i) => (
                                        <View key={i} style={styles.oauthArtistRow}>
                                            <Text style={styles.oauthArtistRank}>#{i + 1}</Text>
                                            <Text style={styles.oauthArtistName}>{artist.name}</Text>
                                            <Text style={styles.oauthArtistPop}>🔥 {artist.popularity}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* 提示导入获取更多数据 */}
                        <View style={styles.importPrompt}>
                            <Text style={styles.importPromptText}>
                                💡 导入 Spotify 数据包可获取详细的听歌时长和更准确的统计
                            </Text>
                            <SpotifyDataImport onImportComplete={handleImportComplete} />
                        </View>
                    </>
                ) : (
                    /* 未验证时显示导入入口 */
                    <>
                        <Text style={styles.tabDescription}>
                            导入 Spotify 数据包，解锁详细统计和高级徽章
                        </Text>
                        <SpotifyDataImport onImportComplete={handleImportComplete} />
                    </>
                )}
            </View>
        );
    };

    // 渲染共识 Tab
    const renderConsensusTab = () => (
        <View style={styles.tabContent}>
            <ConsensusFeed />
        </View>
    );

    // 渲染当前 Tab 内容
    const renderTabContent = () => {
        switch (activeTab) {
            case "verify":
                return renderVerifyTab();
            case "stats":
                return renderStatsTab();
            case "consensus":
                return renderConsensusTab();
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 头部导航 */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerEmoji}>🎵</Text>
                    <Text style={styles.headerTitle}>音乐 Vibe</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* 描述区域 */}
            <LinearGradient
                colors={["#8b5cf6", "#6366f1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.descriptionBanner}
            >
                <Text style={styles.descriptionText}>
                    音乐品味共识社区 · 验证 Spotify 数据 · 铸造 SBT 徽章
                </Text>
            </LinearGradient>

            {/* Tab 切换 */}
            <View style={styles.tabBar}>
                {TABS.map((tab) => (
                    <Pressable
                        key={tab.key}
                        style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                        <Text
                            style={[
                                styles.tabLabel,
                                activeTab === tab.key && styles.tabLabelActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Tab 内容 - consensus tab 不使用 ScrollView 因为 FlatList 自带滚动 */}
            {activeTab === "consensus" ? (
                <View style={styles.scrollView}>
                    {renderTabContent()}
                </View>
            ) : (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {renderTabContent()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ============================================
// 样式
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#09090b" },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#27272a",
    },
    backButton: { paddingVertical: 8, paddingRight: 16 },
    backButtonText: { color: "#8b5cf6", fontSize: 16, fontWeight: "500" },
    headerTitleContainer: { flexDirection: "row", alignItems: "center" },
    headerEmoji: { fontSize: 24, marginRight: 8 },
    headerTitle: { color: "#ffffff", fontSize: 18, fontWeight: "600" },
    headerSpacer: { width: 60 },
    descriptionBanner: { paddingVertical: 12, paddingHorizontal: 16 },
    descriptionText: { color: "#ffffff", fontSize: 13, textAlign: "center", opacity: 0.9 },
    tabBar: { flexDirection: "row", backgroundColor: "#18181b", paddingVertical: 8, paddingHorizontal: 16, gap: 8 },
    tabItem: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#27272a", gap: 6,
    },
    tabItemActive: { backgroundColor: "#8b5cf6" },
    tabEmoji: { fontSize: 16 },
    tabLabel: { color: "#a1a1aa", fontSize: 14, fontWeight: "500" },
    tabLabelActive: { color: "#ffffff" },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    tabContent: { padding: 16 },
    tabDescription: { color: "#71717a", fontSize: 14, marginBottom: 16, lineHeight: 20 },

    // 验证 Tab 样式
    badgesSection: { marginBottom: 16 },
    successCard: { backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "rgba(34, 197, 94, 0.3)" },
    successTitle: { color: "#22c55e", fontSize: 18, fontWeight: "600", marginBottom: 8 },
    successText: { color: "#d1d5db", fontSize: 14, lineHeight: 20 },
    continueButton: { marginTop: 16, backgroundColor: "#27272a", paddingVertical: 10, borderRadius: 8 },
    continueButtonText: { color: "#a1a1aa", textAlign: "center", fontSize: 14 },
    methodSelector: { backgroundColor: "#18181b", borderRadius: 12, padding: 16, marginBottom: 16 },
    methodLabel: { color: "#a1a1aa", fontSize: 14, marginBottom: 12 },
    methodButtons: { flexDirection: "row", gap: 8 },
    methodBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#27272a", alignItems: "center" },
    methodBtnActive: { backgroundColor: "#16a34a" },
    methodBtnActiveImport: { backgroundColor: "#9333ea" },
    methodBtnActiveReclaim: { backgroundColor: "#8b5cf6" },
    methodBtnText: { color: "#a1a1aa", fontSize: 14, fontWeight: "500" },
    methodBtnTextActive: { color: "#ffffff" },
    verifyComponent: { marginBottom: 16 },
    genreSelector: { backgroundColor: "#18181b", borderRadius: 12, padding: 16, marginBottom: 16 },
    genreSelectorTitle: { color: "#ffffff", fontSize: 16, fontWeight: "500", marginBottom: 12 },
    genreButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    genreBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#27272a" },
    genreBtnActive: { backgroundColor: "#9333ea" },
    genreBtnText: { color: "#a1a1aa", fontSize: 14 },
    genreBtnTextActive: { color: "#ffffff" },
    detectedGenres: { backgroundColor: "#18181b", borderRadius: 12, padding: 16, marginBottom: 16 },
    detectedGenresLabel: { color: "#a1a1aa", fontSize: 14, marginBottom: 8 },
    genreTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    genreTag: { backgroundColor: "rgba(139, 92, 246, 0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "rgba(139, 92, 246, 0.4)" },
    genreTagText: { color: "#a78bfa", fontSize: 14, textTransform: "capitalize" },
    resetButton: { marginTop: 16, paddingVertical: 10 },
    resetButtonText: { color: "#71717a", textAlign: "center", fontSize: 14 },

    // 统计 Tab 样式
    dataSourceBadge: { backgroundColor: "#27272a", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 12, alignSelf: "flex-start" },
    dataSourceText: { color: "#a1a1aa", fontSize: 12 },
    oauthStatsCard: { backgroundColor: "#18181b", borderRadius: 16, padding: 16, marginBottom: 16 },
    oauthStatsTitle: { color: "#ffffff", fontSize: 18, fontWeight: "600", marginBottom: 16 },
    oauthSection: { marginBottom: 16 },
    oauthSectionLabel: { color: "#a1a1aa", fontSize: 14, marginBottom: 8 },
    genreChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    genreChip: { backgroundColor: "rgba(139, 92, 246, 0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "rgba(139, 92, 246, 0.3)" },
    genreChipText: { color: "#a78bfa", fontSize: 13, textTransform: "capitalize" },
    oauthArtistRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#27272a" },
    oauthArtistRank: { color: "#71717a", fontSize: 14, width: 32 },
    oauthArtistName: { color: "#ffffff", fontSize: 14, flex: 1 },
    oauthArtistPop: { color: "#f97316", fontSize: 12 },
    importPrompt: { backgroundColor: "rgba(139, 92, 246, 0.1)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "rgba(139, 92, 246, 0.2)" },
    importPromptText: { color: "#a78bfa", fontSize: 13, marginBottom: 12 },
});
