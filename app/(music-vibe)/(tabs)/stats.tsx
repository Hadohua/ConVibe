/**
 * app/(music-vibe)/(tabs)/stats.tsx - Stats.fm 风格统计页面
 * 
 * 完全复刻 Stats.fm UI 风格：
 * - Bento Grid 布局
 * - 时间范围筛选 (4W/6M/LT)
 * - Metric 切换 (Minutes/Streams)
 * - Web3 功能隐形化
 */

import { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    Modal,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
    type StreamingStats,
    type DateRange,
    type TrackStats,
    type ArtistStats,
    parseStreamingHistory,
} from "../../../lib/spotify/streaming-history-parser";
import { loadRawStreamingRecords } from "../../../lib/spotify/streaming-history-storage";
import SpotifyDataImport from "../../../components/SpotifyDataImport";

// ============================================
// 类型定义
// ============================================

type MetricType = "minutes" | "streams";

// ============================================
// 工具函数
// ============================================

/** 生成 ui-avatars 占位图 URL */
function getAvatarUrl(name: string, size: number = 200): string {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=${size}&bold=true`;
}

/** 格式化数字为简写形式 */
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
}

/** 格式化分钟为时:分 */
function formatMinutes(minutes: number): string {
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
}

// ============================================
// 子组件
// ============================================

/** Segmented Control 时间范围选择器 */
function TimeRangeSelector({
    value,
    onChange,
}: {
    value: DateRange;
    onChange: (range: DateRange) => void;
}) {
    const options: { label: string; value: DateRange }[] = [
        { label: "4 Weeks", value: "4W" },
        { label: "6 Months", value: "6M" },
        { label: "Lifetime", value: "LT" },
    ];

    return (
        <View className="flex-row bg-neutral-900 rounded-xl p-1">
            {options.map((option) => (
                <Pressable
                    key={option.value}
                    onPress={() => onChange(option.value)}
                    className={`flex-1 py-2 px-3 rounded-lg ${value === option.value ? "bg-neutral-800" : ""
                        }`}
                >
                    <Text
                        className={`text-center text-sm font-medium ${value === option.value
                                ? "text-white"
                                : "text-neutral-500"
                            }`}
                    >
                        {option.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

/** Metric 切换胶囊 */
function MetricToggle({
    value,
    onChange,
}: {
    value: MetricType;
    onChange: (metric: MetricType) => void;
}) {
    return (
        <View className="flex-row bg-neutral-900/80 rounded-full p-0.5">
            <Pressable
                onPress={() => onChange("minutes")}
                className={`py-1.5 px-3 rounded-full ${value === "minutes" ? "bg-[#1db954]" : ""
                    }`}
            >
                <Text
                    className={`text-xs font-semibold ${value === "minutes" ? "text-black" : "text-neutral-400"
                        }`}
                >
                    Minutes
                </Text>
            </Pressable>
            <Pressable
                onPress={() => onChange("streams")}
                className={`py-1.5 px-3 rounded-full ${value === "streams" ? "bg-[#1db954]" : ""
                    }`}
            >
                <Text
                    className={`text-xs font-semibold ${value === "streams" ? "text-black" : "text-neutral-400"
                        }`}
                >
                    Streams
                </Text>
            </Pressable>
        </View>
    );
}

/** Top Artist Hero Card */
function TopArtistHeroCard({
    artist,
    metric,
    onSparklePress,
}: {
    artist: ArtistStats | null;
    metric: MetricType;
    onSparklePress: () => void;
}) {
    if (!artist) {
        return (
            <View className="flex-1 bg-neutral-900 rounded-2xl h-44 items-center justify-center">
                <Text className="text-neutral-500">No data</Text>
            </View>
        );
    }

    const displayValue =
        metric === "minutes"
            ? formatMinutes(artist.totalMinutes)
            : formatNumber(artist.streamCount);
    const displayLabel = metric === "minutes" ? "minutes listened" : "streams";

    return (
        <View className="flex-1 rounded-2xl overflow-hidden h-44">
            {/* 背景图片 */}
            <Image
                source={{ uri: getAvatarUrl(artist.name, 400) }}
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
            />
            {/* 渐变遮罩 */}
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.95)"]}
                className="absolute inset-0"
            />
            {/* 内容 */}
            <View className="flex-1 p-4 justify-end">
                <Text className="text-neutral-400 text-xs uppercase tracking-wider mb-1">
                    Top Artist
                </Text>
                <Text
                    className="text-white text-xl font-bold mb-1"
                    numberOfLines={1}
                >
                    {artist.name}
                </Text>
                <View className="flex-row items-baseline">
                    <Text className="text-[#1db954] text-3xl font-black">
                        {displayValue}
                    </Text>
                    <Text className="text-neutral-400 text-sm ml-2">
                        {displayLabel}
                    </Text>
                </View>
            </View>
            {/* Web3 隐形入口 - 小金色闪光图标 */}
            <Pressable
                onPress={onSparklePress}
                className="absolute top-3 right-3 w-8 h-8 items-center justify-center"
            >
                <Text className="text-lg opacity-60">✨</Text>
            </Pressable>
        </View>
    );
}

/** 小统计卡片 */
function StatMiniCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View className="flex-1 bg-neutral-900 rounded-2xl p-4 justify-between">
            <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-neutral-800 items-center justify-center mr-2">
                    <Ionicons name={icon} size={16} color="#1db954" />
                </View>
                <Text className="text-neutral-400 text-xs uppercase tracking-wide">
                    {label}
                </Text>
            </View>
            <Text className="text-white text-2xl font-black mt-2">{value}</Text>
        </View>
    );
}

/** 艺人/歌曲列表项 */
function ListItem({
    rank,
    name,
    subtitle,
    value,
    imageUrl,
}: {
    rank: number;
    name: string;
    subtitle: string;
    value: string;
    imageUrl: string;
}) {
    return (
        <View className="flex-row items-center py-3 border-b border-neutral-800/50">
            {/* 排名 */}
            <Text className="text-neutral-500 text-sm font-medium w-8">
                {rank}
            </Text>
            {/* 封面图 */}
            <Image
                source={{ uri: imageUrl }}
                className="w-12 h-12 rounded-lg mr-3"
            />
            {/* 信息 */}
            <View className="flex-1">
                <Text className="text-white font-semibold" numberOfLines={1}>
                    {name}
                </Text>
                <Text className="text-neutral-500 text-sm" numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>
            {/* 数值 */}
            <Text className="text-[#1db954] font-bold">{value}</Text>
        </View>
    );
}

/** Web3 SBT 弹窗 */
function Web3Modal({
    visible,
    onClose,
    topArtist,
}: {
    visible: boolean;
    onClose: () => void;
    topArtist: ArtistStats | null;
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 items-center justify-center p-6">
                <BlurView
                    intensity={40}
                    tint="dark"
                    className="w-full max-w-sm rounded-3xl overflow-hidden"
                >
                    <View className="bg-neutral-900/90 p-6">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-white text-lg font-bold">
                                ✨ Web3 Rewards
                            </Text>
                            <Pressable onPress={onClose}>
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#71717a"
                                />
                            </Pressable>
                        </View>

                        {/* Content */}
                        {topArtist ? (
                            <View>
                                <Text className="text-neutral-400 text-sm mb-4">
                                    Based on your listening stats, you're
                                    eligible to mint a Soulbound Token (SBT)
                                    badge for:
                                </Text>
                                <View className="bg-neutral-800 rounded-xl p-4 mb-4">
                                    <Text className="text-white font-semibold text-lg">
                                        {topArtist.name}
                                    </Text>
                                    <Text className="text-[#1db954] text-sm mt-1">
                                        {topArtist.totalHours.toFixed(1)} hours
                                        listened
                                    </Text>
                                </View>
                                <Pressable className="bg-[#1db954] rounded-xl py-3 items-center">
                                    <Text className="text-black font-bold">
                                        Mint SBT Badge
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Text className="text-neutral-400 text-center py-8">
                                Import your Spotify data to unlock Web3 rewards
                            </Text>
                        )}
                    </View>
                </BlurView>
            </View>
        </Modal>
    );
}

// ============================================
// 主组件
// ============================================

export default function StatsScreen() {
    // 状态
    const [stats, setStats] = useState<StreamingStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<DateRange>("LT");
    const [metric, setMetric] = useState<MetricType>("minutes");
    const [showWeb3Modal, setShowWeb3Modal] = useState(false);

    // 加载/刷新数据
    const loadStats = useCallback(async (range: DateRange) => {
        setIsLoading(true);
        try {
            const records = await loadRawStreamingRecords();
            if (records.length > 0) {
                const parsedStats = parseStreamingHistory(records, range);
                setStats(parsedStats);
            } else {
                setStats(null);
            }
        } catch (error) {
            console.error("Failed to load stats:", error);
            setStats(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        loadStats(timeRange);
    }, []);

    // 时间范围变化时重新加载
    useEffect(() => {
        loadStats(timeRange);
    }, [timeRange, loadStats]);

    // 处理数据导入
    const handleImportComplete = useCallback(
        (importedStats: StreamingStats) => {
            setStats(importedStats);
        },
        []
    );

    // 获取显示数据
    const topArtist = stats?.topArtists?.[0] || null;

    // 渲染列表内容
    const renderArtists = () => {
        if (!stats?.topArtists) return null;
        return stats.topArtists.slice(0, 10).map((artist, index) => (
            <ListItem
                key={artist.name}
                rank={index + 1}
                name={artist.name}
                subtitle={`${artist.topTracks?.[0]?.name || "Top artist"}`}
                value={
                    metric === "minutes"
                        ? formatMinutes(artist.totalMinutes)
                        : formatNumber(artist.streamCount)
                }
                imageUrl={getAvatarUrl(artist.name)}
            />
        ));
    };

    const renderTracks = () => {
        if (!stats?.topTracks) return null;
        return stats.topTracks.slice(0, 10).map((track, index) => (
            <ListItem
                key={`${track.artistName}-${track.name}`}
                rank={index + 1}
                name={track.name}
                subtitle={track.artistName}
                value={
                    metric === "minutes"
                        ? formatMinutes(track.totalMinutes)
                        : formatNumber(track.streamCount)
                }
                imageUrl={getAvatarUrl(track.name)}
            />
        ));
    };

    return (
        <View className="flex-1 bg-black">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                    <Text className="text-white text-2xl font-bold">Stats</Text>
                    <View className="flex-row items-center space-x-2">
                        <MetricToggle value={metric} onChange={setMetric} />
                        <Pressable
                            onPress={() => setShowWeb3Modal(true)}
                            className="w-10 h-10 items-center justify-center rounded-full bg-neutral-900"
                        >
                            <Ionicons
                                name="settings-outline"
                                size={20}
                                color="#71717a"
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Filter Bar */}
                <View className="px-4 mb-4">
                    <TimeRangeSelector
                        value={timeRange}
                        onChange={setTimeRange}
                    />
                </View>

                {/* Content */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#1db954" />
                        <Text className="text-neutral-500 mt-4">
                            Loading stats...
                        </Text>
                    </View>
                ) : stats ? (
                    <View className="px-4">
                        {/* Bento Grid */}
                        <View className="flex-row gap-3 mb-4">
                            {/* Left: Hero Card (60%) */}
                            <View className="flex-[6]">
                                <TopArtistHeroCard
                                    artist={topArtist}
                                    metric={metric}
                                    onSparklePress={() =>
                                        setShowWeb3Modal(true)
                                    }
                                />
                            </View>
                            {/* Right: Mini Cards (40%) */}
                            <View className="flex-[4] gap-3">
                                <StatMiniCard
                                    label="Minutes"
                                    value={formatNumber(stats.totalMinutes)}
                                    icon="time-outline"
                                />
                                <StatMiniCard
                                    label="Streams"
                                    value={formatNumber(stats.totalStreams)}
                                    icon="play-outline"
                                />
                            </View>
                        </View>

                        {/* Additional Stats Row */}
                        <View className="flex-row gap-3 mb-6">
                            <StatMiniCard
                                label="Artists"
                                value={formatNumber(stats.uniqueArtists)}
                                icon="people-outline"
                            />
                            <StatMiniCard
                                label="Tracks"
                                value={formatNumber(stats.uniqueTracks)}
                                icon="musical-notes-outline"
                            />
                        </View>

                        {/* Top Artists Section */}
                        <View className="mb-6">
                            <Text className="text-white text-lg font-bold mb-3">
                                Top Artists
                            </Text>
                            <View className="bg-neutral-900/50 rounded-2xl px-4">
                                {renderArtists()}
                            </View>
                        </View>

                        {/* Top Tracks Section */}
                        <View className="mb-6">
                            <Text className="text-white text-lg font-bold mb-3">
                                Top Tracks
                            </Text>
                            <View className="bg-neutral-900/50 rounded-2xl px-4">
                                {renderTracks()}
                            </View>
                        </View>
                    </View>
                ) : (
                    /* Empty State - Import Data */
                    <View className="px-4 pt-8">
                        <View className="bg-neutral-900 rounded-3xl p-8 items-center">
                            <View className="w-20 h-20 rounded-full bg-neutral-800 items-center justify-center mb-4">
                                <Ionicons
                                    name="analytics-outline"
                                    size={40}
                                    color="#1db954"
                                />
                            </View>
                            <Text className="text-white text-xl font-bold mb-2">
                                No Stats Yet
                            </Text>
                            <Text className="text-neutral-400 text-center mb-6">
                                Import your Spotify data to see detailed
                                listening statistics
                            </Text>
                            <SpotifyDataImport
                                onImportComplete={handleImportComplete}
                                onError={(err) =>
                                    console.error("Import error:", err)
                                }
                            />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Web3 Modal */}
            <Web3Modal
                visible={showWeb3Modal}
                onClose={() => setShowWeb3Modal(false)}
                topArtist={topArtist}
            />
        </View>
    );
}
