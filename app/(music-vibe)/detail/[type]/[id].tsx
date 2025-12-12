/**
 * app/(music-vibe)/detail/[type]/[id].tsx - 详情页
 * 
 * 展示单曲/艺人/专辑的详细信息：
 * - 播放次数
 * - 播放时长
 * - 流派标签
 * - 返回导航
 */

import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DetailStatsChart, DetailStatsData, DetailType } from "../../../../components/stats/DetailStatsChart";
import StatCard from "../../../../components/stats/StatCard";

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
    genres: string[];
    topTracks?: string[];
    firstListened?: string;
    lastListened?: string;
}

// Mock data - 与 rankings.tsx 保持同步
const MOCK_DATA = {
    tracks: {
        names: [
            "Blinding Lights", "Anti-Hero", "As It Was", "Stay", "Heat Waves",
            "Bad Habit", "About Damn Time", "Running Up That Hill", "Shivers",
            "Easy On Me", "Cold Heart", "Ghost", "Industry Baby", "good 4 u",
            "Levitating", "Save Your Tears", "Montero", "Kiss Me More", "Peaches"
        ],
        subtitles: [
            "The Weeknd", "Taylor Swift", "Harry Styles", "The Kid LAROI", "Glass Animals",
            "Steve Lacy", "Lizzo", "Kate Bush", "Ed Sheeran", "Adele",
            "Elton John", "Justin Bieber", "Lil Nas X", "Olivia Rodrigo", "Dua Lipa"
        ],
    },
    artists: {
        names: [
            "Taylor Swift", "The Weeknd", "Drake", "Bad Bunny", "BTS",
            "Ed Sheeran", "Harry Styles", "Doja Cat", "Billie Eilish", "Olivia Rodrigo",
            "Post Malone", "Dua Lipa", "Justin Bieber", "Ariana Grande", "Kanye West"
        ],
        subtitles: [
            "Pop", "R&B", "Hip-Hop", "Reggaeton", "K-Pop",
            "Pop", "Pop", "Pop/Rap", "Alt Pop", "Pop",
            "Hip-Hop", "Pop", "Pop", "Pop", "Hip-Hop"
        ],
    },
    albums: {
        names: [
            "Midnights", "Renaissance", "Harry's House", "Un Verano Sin Ti", "30",
            "=", "Dawn FM", "Happier Than Ever", "Planet Her", "SOUR",
            "Future Nostalgia", "After Hours", "Fine Line", "Donda", "Positions"
        ],
        subtitles: [
            "Taylor Swift", "Beyoncé", "Harry Styles", "Bad Bunny", "Adele",
            "Ed Sheeran", "The Weeknd", "Billie Eilish", "Doja Cat", "Olivia Rodrigo"
        ],
    },
};

// 流派映射
const GENRE_MAP: Record<string, string[]> = {
    "The Weeknd": ["R&B", "Pop", "Synth-pop"],
    "Taylor Swift": ["Pop", "Country Pop", "Indie Folk"],
    "Drake": ["Hip-Hop", "R&B", "Rap"],
    "Bad Bunny": ["Reggaeton", "Latin Trap", "Urbano"],
    "Harry Styles": ["Pop", "Rock", "Soft Rock"],
    "Doja Cat": ["Pop", "Rap", "R&B"],
    "Billie Eilish": ["Alt Pop", "Electropop", "Dark Pop"],
    "Ed Sheeran": ["Pop", "Folk Pop", "Acoustic"],
    "default": ["Pop", "Electronic", "Alternative"],
};

// Mock data generator - 根据 id 动态生成数据
const getMockDetailData = (type: ItemType, id: string): DetailData => {
    // ID 格式: "tracks-0", "artists-1", "albums-more-5"
    const parts = id.split('-');
    let index = 0;

    // 处理 "tracks-more-5" 格式
    if (parts.includes('more')) {
        index = parseInt(parts[parts.length - 1]) || 0;
    } else {
        index = parseInt(parts[parts.length - 1]) || 0;
    }

    const data = MOCK_DATA[type] || MOCK_DATA.tracks;
    const name = data.names[index % data.names.length] || `Unknown ${type}`;
    const subtitle = data.subtitles[index % data.subtitles.length] || "Unknown Artist";

    // 根据 index 生成一致的随机数据 (使用 index 作为种子)
    const seed = index + 1;
    const playCount = type === "artists"
        ? 1000 + seed * 150
        : type === "albums"
            ? 300 + seed * 80
            : 100 + seed * 25;

    const totalMinutes = type === "artists"
        ? 4000 + seed * 400
        : type === "albums"
            ? 1500 + seed * 200
            : 300 + seed * 50;

    // 获取流派
    const artistName = type === "artists" ? name : subtitle;
    const genres = GENRE_MAP[artistName] || GENRE_MAP["default"];

    // 为艺人和专辑生成 top tracks
    const topTracks = type !== "tracks" ? [
        MOCK_DATA.tracks.names[(index * 3) % MOCK_DATA.tracks.names.length],
        MOCK_DATA.tracks.names[(index * 3 + 1) % MOCK_DATA.tracks.names.length],
        MOCK_DATA.tracks.names[(index * 3 + 2) % MOCK_DATA.tracks.names.length],
        MOCK_DATA.tracks.names[(index * 3 + 3) % MOCK_DATA.tracks.names.length],
    ] : undefined;

    // 生成日期
    const year = 2020 + (index % 4);
    const month = ((index * 3) % 12) + 1;
    const day = ((index * 7) % 28) + 1;

    return {
        name,
        subtitle: type === "albums" ? `${subtitle} • ${year}` : subtitle,
        playCount,
        totalMinutes,
        genres,
        topTracks,
        firstListened: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        lastListened: "2024-12-11",
    };
};

// Mock chart data generator (实际应从 Supabase 获取)
const getMockChartData = (type: ItemType, id: string): DetailStatsData => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

    // 解析 index 用于生成一致的数据
    const parts = id.split('-');
    const index = parseInt(parts[parts.length - 1]) || 0;
    const seed = index + 1;

    // 使用 seed 生成一致的数据而非随机
    const baseCount = type === "artists" ? 80 : type === "albums" ? 40 : 20;
    const basePlays = type === "artists" ? 1000 + seed * 150 : type === "albums" ? 300 + seed * 80 : 100 + seed * 25;
    const baseMinutes = type === "artists" ? 4000 + seed * 400 : type === "albums" ? 1500 + seed * 200 : 300 + seed * 50;

    return {
        monthlyPlays: months.map((month, i) => ({
            month,
            count: baseCount + ((seed * (i + 1) * 7) % 30)
        })),
        hourlyDistribution: hours.map((hour, i) => ({
            hour,
            percentage: ((seed + i) * 3) % 25
        })),
        totalPlays: basePlays,
        totalMinutes: baseMinutes,
        avgPerSession: 2.5 + (seed % 3),
        streak: type === "tracks" ? 5 + (seed % 20) : undefined,
    };
};

// ============================================
// Detail 主组件
// ============================================

// ============================================
// Detail 主组件
// ============================================

export default function DetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { type, id } = useLocalSearchParams<{ type: ItemType; id: string }>();

    const itemType = (type as ItemType) || "tracks";
    const data = getMockDetailData(itemType, id || "");
    const chartData = getMockChartData(itemType, id || "");

    // 映射 type 到 DetailType (tracks -> track)
    const detailType: DetailType = itemType === "tracks" ? "track" : itemType === "artists" ? "artist" : "album";

    const typeEmoji = itemType === "tracks" ? "🎵" : itemType === "artists" ? "🎤" : "💿";
    const typeLabel = itemType === "tracks" ? "Track" : itemType === "artists" ? "Artist" : "Album";

    // 安全的返回处理函数
    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/(music-vibe)/rankings");
        }
    };

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
                <LinearGradient
                    colors={["#8b5cf6", "#6366f1", "#4f46e5"]}
                    style={styles.hero}
                >
                    <Text style={styles.heroEmoji}>{typeEmoji}</Text>
                    <Text style={styles.heroName}>{data.name}</Text>
                    <Text style={styles.heroSubtitle}>{data.subtitle}</Text>
                </LinearGradient>

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

                {/* Genres */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🏷️ Genres</Text>
                    <View style={styles.genreTags}>
                        {data.genres.map((genre, index) => (
                            <View key={index} style={styles.genreTag}>
                                <Text style={styles.genreTagText}>{genre}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Top Tracks (for artists/albums) */}
                {data.topTracks && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔥 Top Tracks</Text>
                        {data.topTracks.map((track, index) => (
                            <View key={index} style={styles.trackRow}>
                                <Text style={styles.trackRank}>#{index + 1}</Text>
                                <Text style={styles.trackName}>{track}</Text>
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
                            <Text style={styles.timelineValue}>{data.firstListened}</Text>
                        </View>
                        <View style={styles.timelineDivider} />
                        <View style={styles.timelineRow}>
                            <Text style={styles.timelineLabel}>Last Listened</Text>
                            <Text style={styles.timelineValue}>{data.lastListened}</Text>
                        </View>
                    </View>
                </View>

                {/* 复用的统计图表组件 */}
                <DetailStatsChart type={detailType} data={chartData} />

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
        color: "#8b5cf6",
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
        padding: 16,
    },
    hero: {
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        marginBottom: 20,
    },
    heroEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    heroName: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    heroSubtitle: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 16,
    },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    // StatCard 样式现在由共享组件 components/stats/StatCard.tsx 提供
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    genreTags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    genreTag: {
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(139, 92, 246, 0.4)",
    },
    genreTagText: {
        color: "#a78bfa",
        fontSize: 14,
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
