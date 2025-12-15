/**
 * components/stats/LeaderboardList.tsx - 排行榜组件
 * 
 * 显示 Top 曲目/艺人列表，支持 Tab 切换
 */

import { useState, useMemo } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { Image } from "expo-image";
import type { ArtistStats, TrackStats, SortMetric } from "../../lib/spotify/streaming-history-parser";
import { calculateTierFromPlaytime, sortTracksByMetric, sortArtistsByMetric } from "../../lib/spotify/streaming-history-parser";
import { getTierInfo } from "../../lib/consensus/tier-calculator";

// ============================================
// 类型定义
// ============================================

type TabType = "tracks" | "artists";

interface LeaderboardListProps {
    topTracks: TrackStats[];
    topArtists: ArtistStats[];
    /** 最多显示条数 */
    limit?: number;
    /** 排序和显示指标: 'streams' 按播放次数, 'minutes' 按播放时长 */
    metric?: 'streams' | 'minutes';
}

// ============================================
// Tab 配置
// ============================================

const TABS: { key: TabType; label: string }[] = [
    { key: "tracks", label: "曲目" },
    { key: "artists", label: "艺人" },
];

// ============================================
// LeaderboardList 组件
// ============================================

export default function LeaderboardList({
    topTracks,
    topArtists,
    limit = 10,
    metric = 'minutes',
}: LeaderboardListProps) {
    const [activeTab, setActiveTab] = useState<TabType>("tracks");

    // 根据 metric prop 决定排序方式
    const sortMetric: SortMetric = metric === 'streams' ? 'streamCount' : 'totalMs';

    // 动态排序
    const sortedTracks = useMemo(
        () => sortTracksByMetric(topTracks, sortMetric).slice(0, limit),
        [topTracks, sortMetric, limit]
    );
    const sortedArtists = useMemo(
        () => sortArtistsByMetric(topArtists, sortMetric).slice(0, limit),
        [topArtists, sortMetric, limit]
    );

    return (
        <View className="bg-dark-200 rounded-2xl overflow-hidden">
            {/* Tab 切换 */}
            <View className="flex-row border-b border-dark-50/50">
                {TABS.map((tab) => (
                    <Pressable
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 items-center ${activeTab === tab.key
                            ? "border-b-2 border-green-500"
                            : ""
                            }`}
                    >
                        <Text
                            className={`font-medium ${activeTab === tab.key
                                ? "text-green-500"
                                : "text-gray-500"
                                }`}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* 列表内容 */}
            <View className="p-4">
                {activeTab === "tracks" ? (
                    <TrackList tracks={sortedTracks} metric={metric} />
                ) : (
                    <ArtistList artists={sortedArtists} metric={metric} />
                )}
            </View>
        </View>
    );
}

// ============================================
// TrackList 子组件
// ============================================

function TrackList({ tracks, metric }: { tracks: TrackStats[]; metric: 'streams' | 'minutes' }) {
    if (tracks.length === 0) {
        return (
            <View className="py-8 items-center">
                <Text className="text-gray-500">暂无曲目数据</Text>
            </View>
        );
    }

    return (
        <View>
            {tracks.map((track, index) => (
                <TrackItem key={`${track.artistName}-${track.name}`} track={track} rank={index + 1} metric={metric} />
            ))}
        </View>
    );
}

function TrackItem({ track, rank, metric }: { track: TrackStats; rank: number; metric: 'streams' | 'minutes' }) {
    // 使用 Spotify CDN 占位图
    const placeholderImage = "https://i.scdn.co/image/ab67616d00004851e8e28219724c2423afa4d320";

    // 根据 metric 格式化显示内容
    const primaryValue = metric === 'streams'
        ? `${track.streamCount.toLocaleString()} streams`
        : `${track.totalMinutes.toLocaleString()} min`;

    return (
        <View className="flex-row items-center py-3 border-b border-dark-50/30">
            {/* 排名 */}
            <Text
                className={`w-8 font-bold ${rank <= 3 ? "text-green-500" : "text-gray-500"
                    }`}
            >
                #{rank}
            </Text>

            {/* 专辑封面占位 */}
            <View className="w-12 h-12 rounded-lg bg-dark-50 mr-3 overflow-hidden">
                <Image
                    source={{ uri: placeholderImage }}
                    style={{ width: 48, height: 48 }}
                    contentFit="cover"
                />
            </View>

            {/* 歌曲信息 */}
            <View className="flex-1">
                <Text className="text-white font-medium" numberOfLines={1}>
                    {track.name}
                </Text>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                    {track.artistName}
                </Text>
            </View>

            {/* 数值 - 固定宽度右对齐 */}
            <View className="min-w-[80px] items-end">
                <Text className="text-purple-400 font-medium text-sm">
                    {primaryValue}
                </Text>
            </View>
        </View>
    );
}

// ============================================
// ArtistList 子组件
// ============================================

function ArtistList({ artists, metric }: { artists: ArtistStats[]; metric: 'streams' | 'minutes' }) {
    if (artists.length === 0) {
        return (
            <View className="py-8 items-center">
                <Text className="text-gray-500">暂无艺人数据</Text>
            </View>
        );
    }

    return (
        <View>
            {artists.map((artist, index) => (
                <ArtistItem key={artist.name} artist={artist} rank={index + 1} metric={metric} />
            ))}
        </View>
    );
}

function ArtistItem({ artist, rank, metric }: { artist: ArtistStats; rank: number; metric: 'streams' | 'minutes' }) {
    const tier = calculateTierFromPlaytime(artist.totalHours);
    const tierInfo = getTierInfo(tier);

    // 根据 metric 格式化显示内容
    const primaryValue = metric === 'streams'
        ? `${artist.streamCount.toLocaleString()} streams`
        : `${artist.totalMinutes.toLocaleString()} min`;

    return (
        <View className="flex-row items-center py-3 border-b border-dark-50/30">
            {/* 排名 */}
            <Text
                className={`w-8 font-bold ${rank <= 3 ? "text-green-500" : "text-gray-500"
                    }`}
            >
                #{rank}
            </Text>

            {/* 头像占位 */}
            <View className="w-12 h-12 rounded-full bg-dark-50 mr-3 items-center justify-center">
                <Text className="text-xl">🎤</Text>
            </View>

            {/* 艺人信息 */}
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className="text-white font-medium" numberOfLines={1}>
                        {artist.name}
                    </Text>
                    {tier >= 2 && (
                        <View
                            className="ml-2 px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${tierInfo.color}20` }}
                        >
                            <Text style={{ color: tierInfo.color }} className="text-xs">
                                {tierInfo.emoji}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 数值 - 固定宽度右对齐 */}
            <View className="min-w-[80px] items-end">
                <Text className="text-purple-400 font-medium text-sm">
                    {primaryValue}
                </Text>
            </View>
        </View>
    );
}
