/**
 * app/(music-vibe)/detail/[type]/[id].tsx - 详情页
 * 
 * 展示单曲/艺人/专辑的详细信息：
 * - 使用真实 Spotify 数据
 * - 播放次数和时长
 * - Top Tracks (艺人/专辑)
 */

import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DetailStatsChart, DetailStatsData, DetailType } from "../../../../components/stats/DetailStatsChart";
import StatCard from "../../../../components/stats/StatCard";
import {
    type StreamingStats,
    type TrackStats,
    type ArtistStats,
    type StreamingRecord,
    parseStreamingHistory,
} from "../../../../lib/spotify/streaming-history-parser";
import { loadRawStreamingRecords } from "../../../../lib/spotify/streaming-history-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// 类型定义
// ============================================

type ItemType = "tracks" | "artists" | "albums";

interface DetailData {
    name: string;
    subtitle: string;
    playCount: number;
    totalMinutes: number;
    topTracks?: { name: string; playCount: number }[];
    firstListened?: string;
    lastListened?: string;
}

// ============================================
// 工具函数
// ============================================

/** 生成 ui-avatars 占位图 URL */
function getAvatarUrl(name: string, size: number = 400): string {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=${size}&bold=true`;
}

/** 格式化日期 */
function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "Unknown";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return "Unknown";
    }
}

// ============================================
// Detail 主组件
// ============================================

export default function DetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { type, id } = useLocalSearchParams<{ type: ItemType; id: string }>();

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<StreamingStats | null>(null);
    const [records, setRecords] = useState<StreamingRecord[]>([]);

    const itemType = (type as ItemType) || "tracks";

    // 加载数据
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const rawRecords = await loadRawStreamingRecords();
                if (rawRecords.length > 0) {
                    setRecords(rawRecords);
                    const parsed = parseStreamingHistory(rawRecords);
                    setStats(parsed);
                }
            } catch (error) {
                console.error("Failed to load detail data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // 从 ID 解析索引
    const itemIndex = useMemo(() => {
        if (!id) return 0;
        const parts = id.split("-");
        return parseInt(parts[parts.length - 1]) || 0;
    }, [id]);

    // 获取详情数据
    const data = useMemo((): DetailData | null => {
        if (!stats) return null;

        if (itemType === "tracks") {
            const track = stats.topTracks[itemIndex];
            if (!track) return null;

            // 查找首次和最后播放时间
            const trackRecords = records.filter(
                r => r.master_metadata_track_name === track.name &&
                    r.master_metadata_album_artist_name === track.artistName
            );
            const timestamps = trackRecords.map(r => r.ts).sort();

            return {
                name: track.name,
                subtitle: track.artistName,
                playCount: track.streamCount,
                totalMinutes: track.totalMinutes,
                firstListened: timestamps[0],
                lastListened: timestamps[timestamps.length - 1],
            };
        }

        if (itemType === "artists") {
            const artist = stats.topArtists[itemIndex];
            if (!artist) return null;

            // 查找首次和最后播放时间
            const artistRecords = records.filter(
                r => r.master_metadata_album_artist_name === artist.name
            );
            const timestamps = artistRecords.map(r => r.ts).sort();

            return {
                name: artist.name,
                subtitle: `${artist.streamCount} streams`,
                playCount: artist.streamCount,
                totalMinutes: artist.totalMinutes,
                topTracks: artist.topTracks.map(t => ({
                    name: t.name,
                    playCount: t.streamCount,
                })),
                firstListened: timestamps[0],
                lastListened: timestamps[timestamps.length - 1],
            };
        }

        if (itemType === "albums") {
            // 从 tracks 中聚合专辑数据
            const albumMap = new Map<string, {
                name: string;
                artist: string;
                playCount: number;
                totalMinutes: number;
                tracks: { name: string; playCount: number }[];
                timestamps: string[];
            }>();

            records.forEach(record => {
                if (!record.master_metadata_album_album_name || !record.master_metadata_album_artist_name) return;
                if (record.ms_played < 30000) return;

                const key = `${record.master_metadata_album_album_name}::${record.master_metadata_album_artist_name}`;
                if (!albumMap.has(key)) {
                    albumMap.set(key, {
                        name: record.master_metadata_album_album_name,
                        artist: record.master_metadata_album_artist_name,
                        playCount: 0,
                        totalMinutes: 0,
                        tracks: [],
                        timestamps: [],
                    });
                }
                const album = albumMap.get(key)!;
                album.playCount++;
                album.totalMinutes += Math.round(record.ms_played / 60000);
                album.timestamps.push(record.ts);

                // 添加 track
                const existingTrack = album.tracks.find(t => t.name === record.master_metadata_track_name);
                if (existingTrack) {
                    existingTrack.playCount++;
                } else if (record.master_metadata_track_name) {
                    album.tracks.push({ name: record.master_metadata_track_name, playCount: 1 });
                }
            });

            const albums = Array.from(albumMap.values())
                .sort((a, b) => b.playCount - a.playCount);

            const album = albums[itemIndex];
            if (!album) return null;

            const sortedTimestamps = album.timestamps.sort();

            return {
                name: album.name,
                subtitle: album.artist,
                playCount: album.playCount,
                totalMinutes: album.totalMinutes,
                topTracks: album.tracks.sort((a, b) => b.playCount - a.playCount).slice(0, 5),
                firstListened: sortedTimestamps[0],
                lastListened: sortedTimestamps[sortedTimestamps.length - 1],
            };
        }

        return null;
    }, [stats, records, itemType, itemIndex]);

    // 生成图表数据
    const chartData = useMemo((): DetailStatsData | null => {
        if (!data || !records.length) return null;

        // 过滤相关记录
        let relevantRecords: StreamingRecord[] = [];
        if (itemType === "tracks" && stats?.topTracks[itemIndex]) {
            const track = stats.topTracks[itemIndex];
            relevantRecords = records.filter(
                r => r.master_metadata_track_name === track.name &&
                    r.master_metadata_album_artist_name === track.artistName
            );
        } else if (itemType === "artists" && stats?.topArtists[itemIndex]) {
            const artist = stats.topArtists[itemIndex];
            relevantRecords = records.filter(
                r => r.master_metadata_album_artist_name === artist.name
            );
        } else if (itemType === "albums") {
            // 需要先找到专辑名
            const albumMap = new Map<string, { name: string; artist: string; playCount: number }>();
            records.forEach(r => {
                if (!r.master_metadata_album_album_name || !r.master_metadata_album_artist_name) return;
                if (r.ms_played < 30000) return;
                const key = `${r.master_metadata_album_album_name}::${r.master_metadata_album_artist_name}`;
                if (!albumMap.has(key)) {
                    albumMap.set(key, {
                        name: r.master_metadata_album_album_name,
                        artist: r.master_metadata_album_artist_name,
                        playCount: 0
                    });
                }
                albumMap.get(key)!.playCount++;
            });
            const albums = Array.from(albumMap.values()).sort((a, b) => b.playCount - a.playCount);
            const album = albums[itemIndex];
            if (album) {
                relevantRecords = records.filter(
                    r => r.master_metadata_album_album_name === album.name &&
                        r.master_metadata_album_artist_name === album.artist
                );
            }
        }

        // 计算月度播放
        const monthlyMap = new Map<string, number>();
        const hourlyMap = new Map<number, number>();

        relevantRecords.forEach(r => {
            const date = new Date(r.ts);
            const monthKey = date.toLocaleDateString("en-US", { month: "short" });
            monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);

            const hour = date.getHours();
            hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
        });

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyPlays = months
            .filter(m => monthlyMap.has(m))
            .map(month => ({ month, count: monthlyMap.get(month) || 0 }));

        const totalHourly = Array.from(hourlyMap.values()).reduce((a, b) => a + b, 0) || 1;
        const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
            hour: i.toString().padStart(2, "0"),
            percentage: Math.round((hourlyMap.get(i) || 0) / totalHourly * 100),
        }));

        return {
            monthlyPlays: monthlyPlays.length > 0 ? monthlyPlays : [{ month: "N/A", count: 0 }],
            hourlyDistribution,
            totalPlays: data.playCount,
            totalMinutes: data.totalMinutes,
            avgPerSession: relevantRecords.length > 0
                ? Math.round(data.totalMinutes / relevantRecords.length * 10) / 10
                : 0,
        };
    }, [data, records, stats, itemType, itemIndex]);

    const typeEmoji = itemType === "tracks" ? "🎵" : itemType === "artists" ? "🎤" : "💿";
    const typeLabel = itemType === "tracks" ? "Track" : itemType === "artists" ? "Artist" : "Album";
    const detailType: DetailType = itemType === "tracks" ? "track" : itemType === "artists" ? "artist" : "album";

    // 返回处理
    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/(music-vibe)/rankings");
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#1db954" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.emptyEmoji}>😕</Text>
                <Text style={styles.emptyText}>No data found</Text>
                <Pressable onPress={handleGoBack} style={styles.backButtonEmpty}>
                    <Text style={styles.backButtonText}>← Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Pressable onPress={handleGoBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </Pressable>
                <Text style={styles.headerTitle}>{typeLabel} Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Cover / Hero */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: getAvatarUrl(data.name) }}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.8)", "#09090b"]}
                        style={styles.heroGradient}
                    />
                    <View style={styles.heroContent}>
                        <Text style={styles.heroEmoji}>{typeEmoji}</Text>
                        <Text style={styles.heroName}>{data.name}</Text>
                        <Text style={styles.heroSubtitle}>{data.subtitle}</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        emoji="🎧"
                        value={data.playCount.toLocaleString()}
                        label="Total Plays"
                    />
                    <StatCard
                        emoji="⏱️"
                        value={`${Math.floor(data.totalMinutes / 60)}h ${data.totalMinutes % 60}m`}
                        label="Time Listened"
                    />
                </View>

                {/* Top Tracks (for artists/albums) */}
                {data.topTracks && data.topTracks.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔥 Top Tracks</Text>
                        {data.topTracks.slice(0, 5).map((track, index) => (
                            <View key={index} style={styles.trackRow}>
                                <Text style={styles.trackRank}>#{index + 1}</Text>
                                <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                                <Text style={styles.trackPlays}>{track.playCount}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Timeline</Text>
                    <View style={styles.timelineCard}>
                        <View style={styles.timelineRow}>
                            <Text style={styles.timelineLabel}>First Listened</Text>
                            <Text style={styles.timelineValue}>{formatDate(data.firstListened)}</Text>
                        </View>
                        <View style={styles.timelineDivider} />
                        <View style={styles.timelineRow}>
                            <Text style={styles.timelineLabel}>Last Listened</Text>
                            <Text style={styles.timelineValue}>{formatDate(data.lastListened)}</Text>
                        </View>
                    </View>
                </View>

                {/* 统计图表 */}
                {chartData && <DetailStatsChart type={detailType} data={chartData} />}

                {/* Bottom spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
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
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#71717a",
        marginTop: 12,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: "#71717a",
        fontSize: 16,
        marginBottom: 20,
    },
    backButtonEmpty: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#27272a",
        borderRadius: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: "#09090b",
        borderBottomWidth: 1,
        borderBottomColor: "#27272a",
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#27272a",
        borderRadius: 8,
    },
    backButtonText: {
        color: "#1db954",
        fontSize: 14,
        fontWeight: "600",
    },
    headerTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    headerSpacer: {
        width: 70,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 16,
    },
    heroContainer: {
        height: 280,
        marginBottom: 20,
        position: "relative",
    },
    heroImage: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    heroGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 200,
    },
    heroContent: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
    },
    heroEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    heroName: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
    },
    heroSubtitle: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 16,
    },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    trackRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#18181b",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    trackRank: {
        color: "#71717a",
        fontSize: 14,
        width: 32,
        fontWeight: "600",
    },
    trackName: {
        color: "#ffffff",
        fontSize: 15,
        flex: 1,
    },
    trackPlays: {
        color: "#1db954",
        fontSize: 14,
        fontWeight: "600",
    },
    timelineCard: {
        backgroundColor: "#18181b",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    timelineRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    timelineLabel: {
        color: "#71717a",
        fontSize: 14,
    },
    timelineValue: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
    },
    timelineDivider: {
        height: 1,
        backgroundColor: "#27272a",
        marginVertical: 12,
    },
});
