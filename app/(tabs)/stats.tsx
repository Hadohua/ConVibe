/**
 * app/(tabs)/stats.tsx - Stats.fm 风格统计仪表盘
 * 
 * Bento Grid 布局，支持时间范围筛选和指标切换
 */

import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import LeaderboardList from "../../components/stats/LeaderboardList";
import { loadRawStreamingRecords } from "../../lib/spotify/streaming-history-storage";
import { filterStatsByRange, calculateTierFromPlaytime } from "../../lib/spotify/streaming-history-parser";
import type { StreamingStats, DateRange, StreamingRecord } from "../../lib/spotify/streaming-history-parser";

// ============================================
// 类型定义
// ============================================

type MetricType = 'streams' | 'minutes';

const TIME_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
    { key: '4W', label: '4周' },
    { key: '6M', label: '6月' },
    { key: 'LT', label: '终身' },
];

// ============================================
// StatsScreen 组件
// ============================================

export default function StatsScreen() {
    const router = useRouter();

    // 状态管理
    const [rawRecords, setRawRecords] = useState<StreamingRecord[]>([]);
    const [stats, setStats] = useState<StreamingStats | null>(null);
    const [timeRange, setTimeRange] = useState<DateRange>('LT');
    const [metric, setMetric] = useState<MetricType>('minutes');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    /**
     * 加载原始数据
     */
    const loadData = useCallback(async () => {
        try {
            const records = await loadRawStreamingRecords();
            setRawRecords(records);
            // 初次加载时也计算统计
            if (records.length > 0) {
                const filteredStats = filterStatsByRange(records, timeRange);
                setStats(filteredStats);
            }
        } catch (err) {
            console.error("加载统计数据失败:", err);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    /**
     * 监听时间范围变化，重新计算统计
     */
    useEffect(() => {
        if (rawRecords.length > 0) {
            const filteredStats = filterStatsByRange(rawRecords, timeRange);
            setStats(filteredStats);
        }
    }, [rawRecords, timeRange]);

    /**
     * 初始加载
     */
    useEffect(() => {
        loadData();
    }, []);

    /**
     * 下拉刷新
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    /**
     * 切换 metric
     */
    const toggleMetric = () => {
        setMetric(prev => prev === 'minutes' ? 'streams' : 'minutes');
    };

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
                <ActivityIndicator size="large" color="#a855f7" />
                <Text className="text-gray-400 mt-4">加载统计数据...</Text>
            </View>
        );
    }

    // 无数据
    if (!stats || rawRecords.length === 0) {
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
                    className="bg-purple-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">🎵 导入 Spotify 数据</Text>
                </Pressable>
            </View>
        );
    }

    // 获取 Top Artist
    const topArtist = stats.topArtists[0];
    const topArtistValue = metric === 'minutes'
        ? `${topArtist?.totalMinutes.toLocaleString() || 0} min`
        : `${topArtist?.streamCount.toLocaleString() || 0} streams`;

    // 计算 OG 进度 (10小时目标)
    const ogTargetHours = 10;
    const topArtistHours = topArtist?.totalHours || 0;
    const ogProgress = Math.min(topArtistHours / ogTargetHours, 1);
    const hoursRemaining = Math.max(ogTargetHours - topArtistHours, 0);

    return (
        <ScrollView
            className="flex-1 bg-dark-50"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#a855f7"
                />
            }
        >
            <View className="px-4 pt-16 pb-32">
                {/* ============================================ */}
                {/* Header: 标题 + Metric Toggle */}
                {/* ============================================ */}
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-white text-3xl font-bold">统计数据</Text>
                        <Text className="text-gray-500 text-sm mt-1">
                            {timeRange === 'LT' ? '全部时间' : timeRange === '4W' ? '最近4周' : '最近6个月'}
                        </Text>
                    </View>

                    {/* Metric Toggle 胶囊按钮 */}
                    <Pressable
                        onPress={toggleMetric}
                        className="bg-dark-200 rounded-full flex-row overflow-hidden"
                    >
                        <View className={`px-4 py-2 ${metric === 'minutes' ? 'bg-purple-600' : ''}`}>
                            <Text className={`text-sm font-medium ${metric === 'minutes' ? 'text-white' : 'text-gray-500'}`}>
                                分钟
                            </Text>
                        </View>
                        <View className={`px-4 py-2 ${metric === 'streams' ? 'bg-purple-600' : ''}`}>
                            <Text className={`text-sm font-medium ${metric === 'streams' ? 'text-white' : 'text-gray-500'}`}>
                                次数
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {/* ============================================ */}
                {/* Filter Bar: Segmented Control */}
                {/* ============================================ */}
                <View className="flex-row bg-dark-200 rounded-xl p-1 mb-6">
                    {TIME_RANGE_OPTIONS.map((option) => (
                        <Pressable
                            key={option.key}
                            onPress={() => setTimeRange(option.key)}
                            className={`flex-1 py-2.5 rounded-lg items-center ${timeRange === option.key ? 'bg-purple-600' : ''
                                }`}
                        >
                            <Text className={`font-medium ${timeRange === option.key ? 'text-white' : 'text-gray-500'
                                }`}>
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* ============================================ */}
                {/* Bento Grid */}
                {/* ============================================ */}
                <View className="flex-row mb-6" style={{ gap: 12 }}>
                    {/* Left: Top Artist 大卡片 (60%) */}
                    <View className="flex-1" style={{ flex: 1.5 }}>
                        <LinearGradient
                            colors={['#1f1f23', '#12121a']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="rounded-2xl p-5 h-full"
                            style={{ minHeight: 180 }}
                        >
                            <Text className="text-gray-500 text-sm mb-1">TOP 1 艺人</Text>
                            <Text className="text-white text-2xl font-bold mb-3" numberOfLines={2}>
                                {topArtist?.name || '暂无数据'}
                            </Text>
                            <View className="flex-1 justify-end">
                                <Text className="text-purple-400 text-4xl font-bold">
                                    {topArtistValue}
                                </Text>
                            </View>
                            {/* 装饰元素 */}
                            <View className="absolute top-4 right-4 opacity-20">
                                <Text className="text-6xl">🎤</Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Right: 两个小卡片垂直排列 (40%) */}
                    <View style={{ flex: 1, gap: 12 }}>
                        {/* 上方小卡片: 总播放时长 */}
                        <LinearGradient
                            colors={['#1a1a2e', '#16162a']}
                            className="rounded-2xl p-4 flex-1 justify-center"
                        >
                            <Text className="text-gray-500 text-xs mb-1">总播放时长</Text>
                            <Text className="text-white text-2xl font-bold">
                                {stats.totalHours}
                                <Text className="text-gray-400 text-lg"> h</Text>
                            </Text>
                        </LinearGradient>

                        {/* 下方小卡片: 根据 metric 显示不同内容 */}
                        <LinearGradient
                            colors={['#1a1a2e', '#16162a']}
                            className="rounded-2xl p-4 flex-1 justify-center"
                        >
                            {metric === 'streams' ? (
                                <>
                                    <Text className="text-gray-500 text-xs mb-1">总播放次数</Text>
                                    <Text className="text-white text-2xl font-bold">
                                        {stats.totalStreams.toLocaleString()}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text className="text-gray-500 text-xs mb-1">不同艺人</Text>
                                    <Text className="text-white text-2xl font-bold">
                                        {stats.uniqueArtists.toLocaleString()}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </View>
                </View>

                {/* ============================================ */}
                {/* Vibe/Web3 融合: SBT 铸造进度条 */}
                {/* ============================================ */}
                {topArtist && (
                    <View className="bg-dark-200 rounded-2xl p-5 mb-6">
                        <View className="flex-row items-center mb-3">
                            <Text className="text-lg mr-2">🏆</Text>
                            <Text className="text-white font-bold text-lg flex-1">
                                OG 徽章进度
                            </Text>
                            <Text className="text-purple-400 font-medium">
                                {topArtistHours.toFixed(1)} / {ogTargetHours}h
                            </Text>
                        </View>

                        {/* 进度条 */}
                        <View className="h-3 bg-dark-50 rounded-full overflow-hidden mb-3">
                            <LinearGradient
                                colors={['#a855f7', '#6366f1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: `${ogProgress * 100}%`,
                                    height: '100%',
                                    borderRadius: 999,
                                }}
                            />
                        </View>

                        {/* 文案 */}
                        <Text className="text-gray-400 text-sm leading-5">
                            {ogProgress >= 1 ? (
                                <Text className="text-green-400">
                                    🎉 恭喜！你已达成 OG 徽章条件，可铸造并挖取 $CVIB
                                </Text>
                            ) : (
                                <>
                                    再听 <Text className="text-purple-400 font-medium">{hoursRemaining.toFixed(1)} 小时</Text> {topArtist.name}，
                                    即可铸造 OG 徽章并挖取 <Text className="text-yellow-400">$CVIB</Text>
                                </>
                            )}
                        </Text>

                        {/* 铸造按钮 (满足条件时显示) */}
                        {ogProgress >= 1 && (
                            <Pressable
                                className="bg-purple-600 rounded-xl py-3 mt-4 items-center"
                                onPress={() => router.push('/verify-spotify')}
                            >
                                <Text className="text-white font-bold">铸造 OG 徽章 →</Text>
                            </Pressable>
                        )}
                    </View>
                )}

                {/* ============================================ */}
                {/* 排行榜 */}
                {/* ============================================ */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <Text className="text-lg mr-2">🏅</Text>
                        <Text className="text-white font-bold text-lg">排行榜</Text>
                    </View>
                    <LeaderboardList
                        topTracks={stats.topTracks}
                        topArtists={stats.topArtists}
                        limit={10}
                        metric={metric}
                    />
                </View>

                {/* ============================================ */}
                {/* 数据范围信息 */}
                {/* ============================================ */}
                {(stats.firstStream || stats.lastStream) && (
                    <View className="bg-dark-200/50 rounded-xl p-4">
                        <Text className="text-gray-600 text-xs text-center">
                            数据范围: {formatDate(stats.firstStream)} - {formatDate(stats.lastStream)}
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
