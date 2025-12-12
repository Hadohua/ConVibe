/**
 * app/(music-vibe)/(tabs)/rankings.tsx - 排行榜页面
 * 
 * Stats.fm 风格的排行榜：
 * - 顶部 Tabs: Tracks, Artists, Albums
 * - 无限滚动列表
 * - 点击进入详情页
 */

import { useState, useCallback, useMemo } from "react";
import {
    View, Text, FlatList, Pressable, StyleSheet,
    ActivityIndicator, Image, Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEmbeddedWallet } from "@privy-io/expo";

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
// 模拟数据 (实际应从 Supabase 获取)
// ============================================

const generateMockData = (type: RankingType, count: number): RankingItem[] => {
    const baseData: Record<RankingType, { names: string[]; subtitles: string[] }> = {
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

    const data = baseData[type];
    return Array.from({ length: Math.min(count, data.names.length) }, (_, i) => ({
        id: `${type}-${i}`,
        rank: i + 1,
        name: data.names[i % data.names.length],
        subtitle: data.subtitles[i % data.subtitles.length],
        playCount: Math.floor(Math.random() * 500) + 50,
        duration: type === "tracks" ? `${Math.floor(Math.random() * 3) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : undefined,
    }));
};

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
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.coverImage} />
                ) : (
                    <LinearGradient
                        colors={["#8b5cf6", "#6366f1"]}
                        style={styles.coverPlaceholder}
                    >
                        <Text style={styles.coverPlaceholderText}>
                            {type === "tracks" ? "🎵" : type === "artists" ? "🎤" : "💿"}
                        </Text>
                    </LinearGradient>
                )}
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

            {/* 播放次数 */}
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
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // 模拟数据
    const [data, setData] = useState<RankingItem[]>(() =>
        generateMockData("tracks", 20)
    );

    // 切换类型
    const handleTypeChange = useCallback((type: RankingType) => {
        if (type === activeType) return;

        setIsLoading(true);
        setActiveType(type);

        // 模拟加载
        setTimeout(() => {
            setData(generateMockData(type, 20));
            setIsLoading(false);
        }, 300);
    }, [activeType]);

    // 加载更多
    const handleLoadMore = useCallback(() => {
        if (isLoadingMore || data.length >= 50) return;

        setIsLoadingMore(true);
        setTimeout(() => {
            const moreData = generateMockData(activeType, 10).map((item, i) => ({
                ...item,
                id: `${activeType}-more-${data.length + i}`,
                rank: data.length + i + 1,
            }));
            setData(prev => [...prev, ...moreData]);
            setIsLoadingMore(false);
        }, 500);
    }, [activeType, data.length, isLoadingMore]);

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

    // 渲染底部加载
    const renderFooter = useCallback(() => {
        if (!isLoadingMore) return <View style={{ height: 100 }} />;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator color="#8b5cf6" size="small" />
                <Text style={styles.loadingText}>Loading more...</Text>
            </View>
        );
    }, [isLoadingMore]);

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

    // 渲染空状态加载
    const renderEmptyComponent = useCallback(() => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#8b5cf6" size="large" />
                </View>
            );
        }
        return null;
    }, [isLoading]);

    return (
        <View style={styles.container}>
            {/* FlatList 作为最外层容器，顶部 Tabs 在 ListHeaderComponent 中 */}
            <FlatList
                data={isLoading ? [] : data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyComponent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]} // 让 Tabs 固定在顶部
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
        backgroundColor: "#09090b", // 背景色用于 sticky header
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
        height: 400, // 固定高度确保加载状态正确显示
        justifyContent: "center",
        alignItems: "center",
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
    coverPlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    coverPlaceholderText: {
        fontSize: 20,
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
    loadingFooter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        paddingBottom: 100,
    },
    loadingText: {
        color: "#71717a",
        fontSize: 14,
        marginLeft: 8,
    },
});
