/**
 * app/(music-vibe)/(tabs)/rankings.tsx - 排行榜页面
 * 
 * Stats.fm 风格的排行榜：
 * - 顶部 Tabs: Tracks, Artists, Albums
 * - 使用真实 Spotify 数据
 * - 点击进入详情页
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import {
    View, Text, FlatList, Pressable, StyleSheet,
    ActivityIndicator, Image, Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    type StreamingStats,
    type DateRange,
    type TrackStats,
    type ArtistStats,
    parseStreamingHistory,
} from "../../../lib/spotify/streaming-history-parser";
import { loadRawStreamingRecords } from "../../../lib/spotify/streaming-history-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// 类型定义
// ============================================

type RankingType = "tracks" | "artists" | "albums";

interface RankingItem {
    id: string;
    rank: number;
    name: string;
    subtitle: string;
    imageUrl?: string;
    playCount: number;
    totalMinutes: number;
    duration?: string;
}

interface TopTabProps {
    type: RankingType;
    isActive: boolean;
    onPress: () => void;
    label: string;
    emoji: string;
}

// ============================================
// 工具函数
// ============================================

/** 生成 ui-avatars 占位图 URL */
function getAvatarUrl(name: string, size: number = 200): string {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=${size}&bold=true`;
}

/** 格式化分钟 */
function formatMinutes(minutes: number): string {
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
}

// ============================================
// 顶部 Tab 组件
// ============================================

function TopTab({ type, isActive, onPress, label, emoji }: TopTabProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.topTab, isActive && styles.topTabActive]}
        >
            <Text style={styles.topTabEmoji}>{emoji}</Text>
            <Text style={[styles.topTabLabel, isActive && styles.topTabLabelActive]}>
                {label}
            </Text>
            {isActive && <View style={styles.topTabIndicator} />}
        </Pressable>
    );
}

// ============================================
// 排行榜项组件
// ============================================

function RankingItemCard({
    item,
    type,
    onPress
}: {
    item: RankingItem;
    type: RankingType;
    onPress: () => void;
}) {
    // 根据排名决定样式
    const isTop3 = item.rank <= 3;
    const rankColors = ["#fbbf24", "#9ca3af", "#cd7f32"]; // Gold, Silver, Bronze

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.rankingItem,
                pressed && styles.rankingItemPressed,
            ]}
        >
            {/* 排名 */}
            <View style={styles.rankContainer}>
                <Text style={[
                    styles.rankNumber,
                    isTop3 && { color: rankColors[item.rank - 1] }
                ]}>
                    {item.rank}
                </Text>
            </View>

            {/* 封面图 */}
            <View style={[
                styles.coverContainer,
                type === "artists" && styles.coverContainerRound
            ]}>
                <Image
                    source={{ uri: item.imageUrl || getAvatarUrl(item.name) }}
                    style={styles.coverImage}
                />
            </View>

            {/* 信息 */}
            <View style={styles.infoContainer}>
                <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {item.subtitle}
                </Text>
            </View>

            {/* 播放次数 & 时长 */}
            <View style={styles.statsContainer}>
                <Text style={styles.playCount}>{item.playCount}</Text>
                <Text style={styles.playLabel}>plays</Text>
            </View>

            {/* 箭头 */}
            <Text style={styles.arrow}>›</Text>
        </Pressable>
    );
}

// ============================================
// Rankings 主组件
// ============================================

export default function RankingsScreen() {
    const router = useRouter();
    const [activeType, setActiveType] = useState<RankingType>("tracks");
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<StreamingStats | null>(null);

    // 加载真实数据
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const records = await loadRawStreamingRecords();
                if (records.length > 0) {
                    const parsed = parseStreamingHistory(records);
                    setStats(parsed);
                }
            } catch (error) {
                console.error("Failed to load ranking data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // 转换为 RankingItem 格式
    const data = useMemo((): RankingItem[] => {
        if (!stats) return [];

        if (activeType === "tracks") {
            return stats.topTracks.map((track, index) => ({
                id: `track-${index}`,
                rank: index + 1,
                name: track.name,
                subtitle: track.artistName,
                imageUrl: getAvatarUrl(track.name),
                playCount: track.streamCount,
                totalMinutes: track.totalMinutes,
            }));
        }

        if (activeType === "artists") {
            return stats.topArtists.map((artist, index) => ({
                id: `artist-${index}`,
                rank: index + 1,
                name: artist.name,
                subtitle: `${artist.topTracks?.[0]?.name || "Top artist"}`,
                imageUrl: getAvatarUrl(artist.name),
                playCount: artist.streamCount,
                totalMinutes: artist.totalMinutes,
            }));
        }

        // Albums - 从 tracks 中提取专辑信息
        if (activeType === "albums") {
            const albumMap = new Map<string, {
                name: string;
                artist: string;
                playCount: number;
                totalMinutes: number;
            }>();

            stats.topTracks.forEach(track => {
                const key = `${track.albumName}::${track.artistName}`;
                if (!albumMap.has(key)) {
                    albumMap.set(key, {
                        name: track.albumName,
                        artist: track.artistName,
                        playCount: 0,
                        totalMinutes: 0,
                    });
                }
                const album = albumMap.get(key)!;
                album.playCount += track.streamCount;
                album.totalMinutes += track.totalMinutes;
            });

            return Array.from(albumMap.values())
                .sort((a, b) => b.playCount - a.playCount)
                .slice(0, 50)
                .map((album, index) => ({
                    id: `album-${index}`,
                    rank: index + 1,
                    name: album.name,
                    subtitle: album.artist,
                    imageUrl: getAvatarUrl(album.name),
                    playCount: album.playCount,
                    totalMinutes: album.totalMinutes,
                }));
        }

        return [];
    }, [stats, activeType]);

    // 切换类型
    const handleTypeChange = useCallback((type: RankingType) => {
        if (type === activeType) return;
        setActiveType(type);
    }, [activeType]);

    // 点击项目
    const handleItemPress = useCallback((item: RankingItem) => {
        router.push({
            pathname: "/(music-vibe)/detail/[type]/[id]",
            params: { type: activeType, id: item.id }
        });
    }, [router, activeType]);

    // 渲染列表项
    const renderItem = useCallback(({ item }: { item: RankingItem }) => (
        <RankingItemCard
            item={item}
            type={activeType}
            onPress={() => handleItemPress(item)}
        />
    ), [activeType, handleItemPress]);

    // 渲染底部
    const renderFooter = useCallback(() => (
        <View style={{ height: 100 }} />
    ), []);

    // 渲染顶部 Tabs (作为 ListHeaderComponent)
    const renderListHeader = useCallback(() => (
        <View style={styles.topTabsContainer}>
            <TopTab
                type="tracks"
                isActive={activeType === "tracks"}
                onPress={() => handleTypeChange("tracks")}
                label="Tracks"
                emoji="🎵"
            />
            <TopTab
                type="artists"
                isActive={activeType === "artists"}
                onPress={() => handleTypeChange("artists")}
                label="Artists"
                emoji="🎤"
            />
            <TopTab
                type="albums"
                isActive={activeType === "albums"}
                onPress={() => handleTypeChange("albums")}
                label="Albums"
                emoji="💿"
            />
        </View>
    ), [activeType, handleTypeChange]);

    // 渲染空状态
    const renderEmptyComponent = useCallback(() => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#1db954" size="large" />
                    <Text style={styles.loadingText}>Loading your music...</Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyTitle}>No Data Yet</Text>
                <Text style={styles.emptyText}>
                    Import your Spotify data in the Stats tab to see your rankings
                </Text>
            </View>
        );
    }, [isLoading]);

    return (
        <View style={styles.container}>
            <FlatList
                data={isLoading ? [] : data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyComponent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]}
            />
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
    topTabsContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#27272a",
        backgroundColor: "#09090b",
    },
    topTab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: "#18181b",
        marginHorizontal: 4,
        position: "relative",
    },
    topTabActive: {
        backgroundColor: "#27272a",
    },
    topTabEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    topTabLabel: {
        color: "#71717a",
        fontSize: 14,
        fontWeight: "600",
    },
    topTabLabelActive: {
        color: "#ffffff",
    },
    topTabIndicator: {
        position: "absolute",
        bottom: 0,
        width: 20,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#1db954",
    },
    loadingContainer: {
        height: 400,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#71717a",
        fontSize: 14,
        marginTop: 12,
    },
    emptyContainer: {
        height: 400,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptyText: {
        color: "#71717a",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    rankingItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#18181b",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    rankingItemPressed: {
        backgroundColor: "#27272a",
        transform: [{ scale: 0.98 }],
    },
    rankContainer: {
        width: 32,
        alignItems: "center",
    },
    rankNumber: {
        color: "#a1a1aa",
        fontSize: 16,
        fontWeight: "700",
    },
    coverContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        overflow: "hidden",
        marginRight: 12,
    },
    coverContainerRound: {
        borderRadius: 24,
    },
    coverImage: {
        width: "100%",
        height: "100%",
    },
    infoContainer: {
        flex: 1,
    },
    itemName: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 2,
    },
    itemSubtitle: {
        color: "#71717a",
        fontSize: 13,
    },
    statsContainer: {
        alignItems: "flex-end",
        marginRight: 8,
    },
    playCount: {
        color: "#1db954",
        fontSize: 15,
        fontWeight: "700",
    },
    playLabel: {
        color: "#71717a",
        fontSize: 11,
    },
    arrow: {
        color: "#71717a",
        fontSize: 24,
        fontWeight: "300",
    },
});
