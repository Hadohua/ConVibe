/**
 * app/(music-vibe)/(tabs)/stats.tsx - 统计页面
 * 
 * 从 music-vibe-detail.tsx 迁移的统计功能：
 * - 听歌时长可视化
 * - 播放次数统计
 * - 时间范围筛选
 * - 实时同步状态
 */

import { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useEmbeddedWallet } from "@privy-io/expo";
import SpotifyStats from "../../../components/SpotifyStats";
import SpotifyDataImport from "../../../components/SpotifyDataImport";
import DateRangePicker from "../../../components/stats/DateRangePicker";
import LeaderboardList from "../../../components/stats/LeaderboardList";
import SyncStatusCard from "../../../components/stats/SyncStatusCard";
import { type StreamingStats, getStatsFromDatabase } from "../../../lib/spotify/streaming-history-parser";

// ============================================
// Stats 主组件
// ============================================

export default function StatsScreen() {
    const wallet = useEmbeddedWallet();

    // 统计数据状态
    const [importedStats, setImportedStats] = useState<StreamingStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 时间范围筛选状态
    const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
    const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
    const [filteredStats, setFilteredStats] = useState<StreamingStats | null>(null);
    const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);

    // 获取用户 ID
    const userId = wallet.status === "connected" && wallet.account
        ? wallet.account.address
        : undefined;

    // 初始化加载数据
    useEffect(() => {
        async function loadStats() {
            if (!userId) {
                setIsLoading(false);
                return;
            }

            try {
                const stats = await getStatsFromDatabase(userId);
                setImportedStats(stats);
            } catch (error) {
                console.error("加载统计数据失败:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, [userId]);

    // 处理数据导入
    const handleImportComplete = useCallback((stats: StreamingStats) => {
        console.log("数据导入完成:", stats);
        setImportedStats(stats);
    }, []);

    // 日期范围变化处理
    const handleDateRangeChange = useCallback(async (start: Date | null, end: Date | null) => {
        setDateRangeStart(start);
        setDateRangeEnd(end);

        if (!userId) {
            setFilteredStats(null);
            return;
        }

        // 如果没有选择日期范围，显示全部数据
        if (!start && !end) {
            setFilteredStats(null);
            return;
        }

        setIsLoadingFiltered(true);
        try {
            const stats = await getStatsFromDatabase(userId, start || undefined, end || undefined);
            setFilteredStats(stats);
        } catch (error) {
            console.error("获取筛选数据失败:", error);
            setFilteredStats(null);
        } finally {
            setIsLoadingFiltered(false);
        }
    }, [userId]);

    // 计算显示的数据
    const displayStats = filteredStats || importedStats;
    const dataStartDate = importedStats?.firstStream ? new Date(importedStats.firstStream) : null;
    const dataEndDate = importedStats?.lastStream ? new Date(importedStats.lastStream) : null;
    const isFiltered = !!filteredStats && (dateRangeStart || dateRangeEnd);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* 页面标题 */}
            <View style={styles.header}>
                <Text style={styles.title}>📊 Your Stats</Text>
                <Text style={styles.subtitle}>
                    Deep dive into your listening history
                </Text>
            </View>

            {/* 有数据时显示完整统计 */}
            {displayStats ? (
                <>
                    {/* 数据来源标签 */}
                    <View style={styles.dataSourceBadge}>
                        <Text style={styles.dataSourceText}>
                            📊 Data: Spotify Export
                        </Text>
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

                    {/* 加载状态 */}
                    {isLoadingFiltered && (
                        <View style={styles.loadingOverlay}>
                            <Text style={styles.loadingText}>Loading filtered data...</Text>
                        </View>
                    )}

                    {/* 筛选指示器 */}
                    {isFiltered && (
                        <View style={styles.filterIndicator}>
                            <Text style={styles.filterIndicatorText}>
                                📅 Showing {displayStats.totalStreams.toLocaleString()} records in range
                            </Text>
                        </View>
                    )}

                    {/* 统计概览 */}
                    <SpotifyStats stats={displayStats} showFullDetails />

                    {/* 排行榜 */}
                    <View style={styles.leaderboardSection}>
                        <LeaderboardList
                            topTracks={displayStats.topTracks}
                            topArtists={displayStats.topArtists}
                            limit={10}
                        />
                    </View>
                </>
            ) : isLoading ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateEmoji}>⏳</Text>
                    <Text style={styles.emptyStateText}>Loading your stats...</Text>
                </View>
            ) : (
                /* 未导入数据时显示导入入口 */
                <View style={styles.importSection}>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateEmoji}>📦</Text>
                        <Text style={styles.emptyStateTitle}>No Data Yet</Text>
                        <Text style={styles.emptyStateText}>
                            Import your Spotify data package to unlock detailed statistics and premium badges
                        </Text>
                    </View>

                    <SpotifyDataImport
                        onImportComplete={handleImportComplete}
                        onError={(err) => console.error("Import error:", err)}
                    />
                </View>
            )}

            {/* 底部安全区域 */}
            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

// ============================================
// 样式
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#09090b",
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
    },
    subtitle: {
        color: "#71717a",
        fontSize: 14,
    },
    dataSourceBadge: {
        backgroundColor: "#27272a",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignSelf: "flex-start",
    },
    dataSourceText: {
        color: "#a1a1aa",
        fontSize: 12,
    },
    loadingOverlay: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: "center",
    },
    loadingText: {
        color: "#a78bfa",
        fontSize: 14,
    },
    filterIndicator: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(34, 197, 94, 0.3)",
    },
    filterIndicatorText: {
        color: "#22c55e",
        fontSize: 13,
        textAlign: "center",
    },
    leaderboardSection: {
        marginTop: 16,
    },
    emptyState: {
        backgroundColor: "#18181b",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    emptyStateEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyStateTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptyStateText: {
        color: "#71717a",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
    importSection: {
        marginTop: 8,
    },
});
