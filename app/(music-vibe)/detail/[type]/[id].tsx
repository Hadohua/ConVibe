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

// Mock data generator
const getMockDetailData = (type: ItemType, id: string): DetailData => {
    const baseData: Record<ItemType, DetailData> = {
        tracks: {
            name: "Blinding Lights",
            subtitle: "The Weeknd",
            playCount: 247,
            totalMinutes: 892,
            genres: ["Synth-pop", "R&B", "Dance"],
            firstListened: "2020-03-15",
            lastListened: "2024-12-10",
        },
        artists: {
            name: "The Weeknd",
            subtitle: "R&B / Pop",
            playCount: 1832,
            totalMinutes: 6540,
            genres: ["R&B", "Pop", "Synth-pop", "Alternative R&B"],
            topTracks: ["Blinding Lights", "Save Your Tears", "Starboy", "The Hills", "Can't Feel My Face"],
            firstListened: "2018-06-22",
            lastListened: "2024-12-11",
        },
        albums: {
            name: "After Hours",
            subtitle: "The Weeknd • 2020",
            playCount: 524,
            totalMinutes: 2890,
            genres: ["Synth-pop", "R&B", "New Wave"],
            topTracks: ["Blinding Lights", "Save Your Tears", "In Your Eyes", "After Hours"],
            firstListened: "2020-03-20",
            lastListened: "2024-11-28",
        },
    };

    return baseData[type] || baseData.tracks;
};

// ============================================
// Stat Card 组件
// ============================================

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statEmoji}>{emoji}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ============================================
// Detail 主组件
// ============================================

export default function DetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { type, id } = useLocalSearchParams<{ type: ItemType; id: string }>();

    const itemType = (type as ItemType) || "tracks";
    const data = getMockDetailData(itemType, id || "");

    const typeEmoji = itemType === "tracks" ? "🎵" : itemType === "artists" ? "🎤" : "💿";
    const typeLabel = itemType === "tracks" ? "Track" : itemType === "artists" ? "Artist" : "Album";

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
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
    statCard: {
        flex: 1,
        backgroundColor: "#18181b",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#27272a",
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        color: "#1db954",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 4,
    },
    statLabel: {
        color: "#71717a",
        fontSize: 12,
    },
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
