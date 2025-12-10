/**
 * app/(tabs)/stats.tsx - 统计仪表盘页面
 * 
 * 类似 Stats.fm 的统计展示页面
 * 显示用户听歌数据与 SBT 价值的关系
 */

import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useEmbeddedWallet } from "@privy-io/expo";
import StatCard from "../../components/stats/StatCard";
import LeaderboardList from "../../components/stats/LeaderboardList";
import TierProgressCard from "../../components/stats/TierProgressCard";
import { loadStreamingStats } from "../../lib/spotify/streaming-history-storage";
import { calculateTierFromPlaytime } from "../../lib/spotify/streaming-history-parser";
import type { StreamingStats } from "../../lib/spotify/streaming-history-parser";
import { Genre } from "../../lib/types/proposal";

// ============================================
// StatsScreen 组件
// ============================================

export default function StatsScreen() {
    const router = useRouter();
    const wallet = useEmbeddedWallet();

    const [stats, setStats] = useState<StreamingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    /**
     * 加载统计数据
     */
    const loadStats = useCallback(async () => {
        try {
            const data = await loadStreamingStats();
            setStats(data);
        } catch (err) {
            console.error("加载统计数据失败:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 下拉刷新
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    /**
     * 初始加载
     */
    useEffect(() => {
        loadStats();
    }, [loadStats]);

    /**
     * 导航到数据导入页面
     */
    const goToImport = () => {
        router.push("/verify-spotify");
    };

    // 加载中
    if (loading) {
        return (
            <View className="flex-1 bg-dark-50 items-center justify-center">
                <ActivityIndicator size="large" color="#1db954" />
                <Text className="text-gray-400 mt-4">加载统计数据...</Text>
            </View>
        );
    }

    // 无数据
    if (!stats) {
        return (
            <View className="flex-1 bg-dark-50 items-center justify-center px-8">
                <Text className="text-5xl mb-4">📊</Text>
                <Text className="text-white text-xl font-bold text-center mb-2">
                    暂无听歌数据
                </Text>
                <Text className="text-gray-400 text-center mb-6">
                    导入你的 Spotify 数据后，这里将显示详细的统计分析
                </Text>
                <Pressable
                    onPress={goToImport}
                    className="bg-green-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">🎵 导入 Spotify 数据</Text>
                </Pressable>
            </View>
        );
    }

    // 计算 Top Artist 的 Tier
    const topArtist = stats.topArtists[0];
    const topArtistTier = topArtist ? calculateTierFromPlaytime(topArtist.totalHours) : 1;

    // 推断流派（简化版：根据 Top Artist 推断为 Hip-Hop）
    // 实际项目中应该根据艺人信息判断
    const primaryGenreId = Genre.HIPHOP;

    return (
        <ScrollView
            className="flex-1 bg-dark-50"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#1db954"
                />
            }
        >
            <View className="px-4 pt-16 pb-32">
                {/* 页面标题 */}
                <View className="mb-6">
                    <Text className="text-white text-3xl font-bold">统计</Text>
                    <Text className="text-gray-400 mt-1">
                        你的音乐品味数据
                    </Text>
                </View>

                {/* 统计卡片网格 */}
                <View className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
                    <View style={{ width: "48%" }}>
                        <StatCard
                            value={stats.totalStreams}
                            label="播放次数"
                            changePercent={68}
                            color="green"
                        />
                    </View>
                    <View style={{ width: "48%" }}>
                        <StatCard
                            value={stats.uniqueTracks}
                            label="不同的曲目"
                            changePercent={13}
                            color="green"
                        />
                    </View>
                    <View style={{ width: "48%" }}>
                        <StatCard
                            value={stats.totalMinutes.toLocaleString()}
                            label="播放分钟数"
                            changePercent={76}
                            color="purple"
                        />
                    </View>
                    <View style={{ width: "48%" }}>
                        <StatCard
                            value={stats.uniqueArtists}
                            label="不同的艺人"
                            changePercent={-52}
                            color="purple"
                        />
                    </View>
                    <View style={{ width: "48%" }}>
                        <StatCard
                            value={`${stats.totalHours}h`}
                            label="播放小时数"
                            changePercent={80}
                            color="yellow"
                        />
                    </View>
                    <View style={{ width: "48%" }}>
                        <StatCard
                            value={stats.topArtists.length}
                            label="不同的专辑"
                            changePercent={-62}
                            color="yellow"
                        />
                    </View>
                </View>

                {/* SBT 价值进度卡片 */}
                {topArtist && (
                    <View className="mb-6">
                        <Text className="text-white font-bold text-lg mb-3">
                            🎯 SBT 徽章进度
                        </Text>
                        <TierProgressCard
                            genreId={primaryGenreId}
                            currentHours={topArtist.totalHours}
                            currentTier={topArtistTier}
                            hasMinted={false}
                        />
                    </View>
                )}

                {/* 排行榜 */}
                <View className="mb-6">
                    <Text className="text-white font-bold text-lg mb-3">
                        🏆 排行榜
                    </Text>
                    <LeaderboardList
                        topTracks={stats.topTracks}
                        topArtists={stats.topArtists}
                        limit={10}
                    />
                </View>

                {/* 数据时间范围 */}
                {(stats.firstStream || stats.lastStream) && (
                    <View className="bg-dark-200 rounded-xl p-4">
                        <Text className="text-gray-500 text-xs text-center">
                            数据范围: {formatDate(stats.firstStream)} - {formatDate(stats.lastStream)}
                        </Text>
                        <Text className="text-gray-600 text-xs text-center mt-1">
                            导入于 {new Date(stats.importedAt).toLocaleDateString("zh-CN")}
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

// ============================================
// 辅助函数
// ============================================

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "未知";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
}
