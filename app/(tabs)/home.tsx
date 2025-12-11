/**
 * app/(tabs)/home.tsx - 主页 (Reddit-style)
 * 
 * 重构后的主页，展示：
 * - 2x5 Vibe Blocks 网格
 * - 综合社区 Feed
 */

import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { usePrivy, useEmbeddedWallet } from "@privy-io/expo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BLOCK_SIZE = (SCREEN_WIDTH - 48 - 12) / 2; // 2 columns with padding and gap

// ============================================
// Vibe Block 类型定义
// ============================================

interface VibeBlock {
    id: string;
    name: string;
    emoji: string;
    color: string;
    gradientColors: [string, string];
    isActive: boolean;
    route?: string;
}

// 预定义的 Vibe Blocks
const VIBE_BLOCKS: VibeBlock[] = [
    {
        id: "music",
        name: "音乐 Vibe",
        emoji: "🎵",
        color: "#8b5cf6",
        gradientColors: ["#8b5cf6", "#6366f1"],
        isActive: true,
        route: "/(music-vibe)/rankings",
    },
    {
        id: "gaming",
        name: "游戏 Vibe",
        emoji: "🎮",
        color: "#10b981",
        gradientColors: ["#10b981", "#059669"],
        isActive: false,
    },
    {
        id: "movie",
        name: "电影 Vibe",
        emoji: "🎬",
        color: "#f59e0b",
        gradientColors: ["#f59e0b", "#d97706"],
        isActive: false,
    },
    {
        id: "fitness",
        name: "健身 Vibe",
        emoji: "💪",
        color: "#ef4444",
        gradientColors: ["#ef4444", "#dc2626"],
        isActive: false,
    },
    {
        id: "travel",
        name: "旅行 Vibe",
        emoji: "✈️",
        color: "#06b6d4",
        gradientColors: ["#06b6d4", "#0891b2"],
        isActive: false,
    },
    {
        id: "food",
        name: "美食 Vibe",
        emoji: "🍜",
        color: "#f97316",
        gradientColors: ["#f97316", "#ea580c"],
        isActive: false,
    },
];

// 占位 Feed 数据
const PLACEHOLDER_FEED = [
    {
        id: "1",
        title: "🎤 谁是最被低估的说唱歌手？",
        votes: 128,
        comments: 45,
        vibe: "音乐 Vibe",
    },
    {
        id: "2",
        title: "🎸 2024年最佳摇滚专辑投票",
        votes: 89,
        comments: 32,
        vibe: "音乐 Vibe",
    },
    {
        id: "3",
        title: "🎹 古典乐入门推荐榜单共识",
        votes: 67,
        comments: 28,
        vibe: "音乐 Vibe",
    },
];

// ============================================
// Vibe Block 组件
// ============================================

function VibeBlockCard({ block, onPress }: { block: VibeBlock; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={!block.isActive}
            style={({ pressed }) => [
                styles.vibeBlock,
                { opacity: pressed && block.isActive ? 0.8 : 1 },
            ]}
        >
            <LinearGradient
                colors={block.isActive ? block.gradientColors : ["#27272a", "#18181b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.vibeBlockGradient}
            >
                <Text style={styles.vibeBlockEmoji}>{block.emoji}</Text>
                <Text style={[styles.vibeBlockName, !block.isActive && styles.vibeBlockNameInactive]}>
                    {block.name}
                </Text>
                {block.isActive ? (
                    <View style={styles.activeIndicator}>
                        <Text style={styles.activeIndicatorText}>进入 →</Text>
                    </View>
                ) : (
                    <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>即将上线</Text>
                    </View>
                )}
            </LinearGradient>
        </Pressable>
    );
}

// ============================================
// Feed Card 组件
// ============================================

function FeedCard({ item }: { item: typeof PLACEHOLDER_FEED[0] }) {
    return (
        <View style={styles.feedCard}>
            <View style={styles.feedCardHeader}>
                <Text style={styles.feedCardVibe}>{item.vibe}</Text>
            </View>
            <Text style={styles.feedCardTitle}>{item.title}</Text>
            <View style={styles.feedCardStats}>
                <Text style={styles.feedCardStat}>👍 {item.votes}</Text>
                <Text style={styles.feedCardStat}>💬 {item.comments}</Text>
            </View>
        </View>
    );
}

// ============================================
// HomeScreen 主组件
// ============================================

export default function HomeScreen() {
    const { user } = usePrivy();
    const wallet = useEmbeddedWallet();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleVibePress = (block: VibeBlock) => {
        if (block.route) {
            router.push(block.route as any);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#8b5cf6"
                />
            }
        >
            <View style={styles.content}>
                {/* 头部 */}
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>探索 Vibes 👋</Text>
                    <Text style={styles.titleText}>VibeConsensus</Text>
                </View>

                {/* Vibe Blocks 网格 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🌈 Vibe Blocks</Text>
                    <Text style={styles.sectionSubtitle}>选择你感兴趣的领域社区</Text>
                    <View style={styles.vibeGrid}>
                        {VIBE_BLOCKS.map((block) => (
                            <VibeBlockCard
                                key={block.id}
                                block={block}
                                onPress={() => handleVibePress(block)}
                            />
                        ))}
                    </View>
                </View>

                {/* 综合社区 Feed */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔥 热门共识</Text>
                    <Text style={styles.sectionSubtitle}>社区正在讨论的话题</Text>
                    {PLACEHOLDER_FEED.map((item) => (
                        <FeedCard key={item.id} item={item} />
                    ))}

                    {/* 查看更多 */}
                    <Pressable style={styles.viewMoreButton}>
                        <Text style={styles.viewMoreText}>查看更多热门话题 →</Text>
                    </Pressable>
                </View>

                {/* 底部安全区域 */}
                <View style={{ height: 100 }} />
            </View>
        </ScrollView>
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
    content: {
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 24,
    },
    welcomeText: {
        color: "#a1a1aa",
        fontSize: 16,
    },
    titleText: {
        color: "#ffffff",
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 4,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    sectionSubtitle: {
        color: "#71717a",
        fontSize: 14,
        marginBottom: 16,
    },
    vibeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    vibeBlock: {
        width: BLOCK_SIZE,
        height: BLOCK_SIZE * 0.8,
        borderRadius: 16,
        overflow: "hidden",
    },
    vibeBlockGradient: {
        flex: 1,
        padding: 16,
        justifyContent: "space-between",
    },
    vibeBlockEmoji: {
        fontSize: 32,
    },
    vibeBlockName: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    vibeBlockNameInactive: {
        color: "#71717a",
    },
    activeIndicator: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    activeIndicatorText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "500",
    },
    comingSoonBadge: {
        backgroundColor: "rgba(113, 113, 122, 0.3)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    comingSoonText: {
        color: "#71717a",
        fontSize: 12,
    },
    feedCard: {
        backgroundColor: "#18181b",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    feedCardHeader: {
        marginBottom: 8,
    },
    feedCardVibe: {
        color: "#8b5cf6",
        fontSize: 12,
        fontWeight: "500",
    },
    feedCardTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 12,
    },
    feedCardStats: {
        flexDirection: "row",
        gap: 16,
    },
    feedCardStat: {
        color: "#71717a",
        fontSize: 14,
    },
    viewMoreButton: {
        backgroundColor: "#27272a",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 4,
    },
    viewMoreText: {
        color: "#8b5cf6",
        fontSize: 14,
        fontWeight: "500",
    },
});
