/**
 * components/SpotifyStats.tsx
 * 
 * Spotify 统计展示组件
 * 展示导入数据的详细统计信息
 */

import { View, Text, ScrollView, Pressable } from "react-native";
import type { StreamingStats, ArtistStats, TrackStats } from "../lib/spotify/streaming-history-parser";
import { calculateTierFromPlaytime } from "../lib/spotify/streaming-history-parser";
import { getTierInfo } from "../lib/consensus/tier-calculator";

// ============================================
// 类型定义
// ============================================

interface SpotifyStatsProps {
    stats: StreamingStats;
    showFullDetails?: boolean;
}

// ============================================
// 辅助函数
// ============================================

function formatDuration(hours: number): string {
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.round(hours % 24);
        return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
}

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

// ============================================
// SpotifyStats 组件
// ============================================

export default function SpotifyStats({ stats, showFullDetails = false }: SpotifyStatsProps) {
    return (
        <View className="bg-dark-200 rounded-2xl overflow-hidden">
            {/* 头部统计卡片 */}
            <View className="p-4 bg-purple-900/20 border-b border-purple-700/30">
                <View className="flex-row flex-wrap gap-4">
                    <View className="flex-1 min-w-[45%]">
                        <Text className="text-purple-400 text-3xl font-bold">
                            {stats.totalStreams.toLocaleString()}
                        </Text>
                        <Text className="text-gray-400 text-sm">streams</Text>
                    </View>
                    <View className="flex-1 min-w-[45%]">
                        <Text className="text-purple-400 text-3xl font-bold">
                            {stats.totalMinutes.toLocaleString()}
                        </Text>
                        <Text className="text-gray-400 text-sm">minutes</Text>
                    </View>
                    <View className="flex-1 min-w-[45%]">
                        <Text className="text-purple-400 text-3xl font-bold">
                            {formatDuration(stats.totalHours)}
                        </Text>
                        <Text className="text-gray-400 text-sm">total time</Text>
                    </View>
                    <View className="flex-1 min-w-[45%]">
                        <Text className="text-purple-400 text-3xl font-bold">
                            {stats.uniqueTracks.toLocaleString()}
                        </Text>
                        <Text className="text-gray-400 text-sm">different tracks</Text>
                    </View>
                </View>

                {/* 时间范围 */}
                {(stats.firstStream || stats.lastStream) && (
                    <View className="mt-4 pt-4 border-t border-purple-700/20">
                        <Text className="text-gray-500 text-xs">
                            数据范围: {formatDate(stats.firstStream)} - {formatDate(stats.lastStream)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Top Artists */}
            {stats.topArtists.length > 0 && (
                <View className="p-4 border-b border-dark-50/50">
                    <Text className="text-white font-semibold mb-3">Top Artists</Text>
                    {stats.topArtists.slice(0, showFullDetails ? 10 : 5).map((artist, index) => (
                        <ArtistRow key={artist.name} artist={artist} rank={index + 1} />
                    ))}
                </View>
            )}

            {/* Top Tracks */}
            {stats.topTracks.length > 0 && (
                <View className="p-4">
                    <Text className="text-white font-semibold mb-3">Top Tracks</Text>
                    {stats.topTracks.slice(0, showFullDetails ? 10 : 5).map((track, index) => (
                        <TrackRow key={`${track.artistName}-${track.name}`} track={track} rank={index + 1} />
                    ))}
                </View>
            )}
        </View>
    );
}

// ============================================
// 子组件
// ============================================

function ArtistRow({ artist, rank }: { artist: ArtistStats; rank: number }) {
    const tier = calculateTierFromPlaytime(artist.totalHours);
    const tierInfo = getTierInfo(tier);

    return (
        <View className="flex-row items-center py-2 border-b border-dark-50/30">
            <Text className="text-gray-500 w-8 text-sm">#{rank}</Text>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className="text-white font-medium">{artist.name}</Text>
                    {tier > 0 && (
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
                <Text className="text-gray-500 text-xs">
                    {artist.totalHours}h · {artist.streamCount} streams
                </Text>
            </View>
        </View>
    );
}

function TrackRow({ track, rank }: { track: TrackStats; rank: number }) {
    return (
        <View className="flex-row items-center py-2 border-b border-dark-50/30">
            <Text className="text-gray-500 w-8 text-sm">#{rank}</Text>
            <View className="flex-1">
                <Text className="text-white font-medium" numberOfLines={1}>
                    {track.name}
                </Text>
                <Text className="text-gray-500 text-xs">
                    {track.artistName} · {track.totalMinutes}min · {track.streamCount} streams
                </Text>
            </View>
        </View>
    );
}

// 导出类型
export type { SpotifyStatsProps };
