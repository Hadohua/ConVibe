/**
 * app/(music-vibe)/_layout.tsx - Music Vibe 模块布局
 * 
 * Stats.fm 风格的独立导航模块：
 * - 自定义底部 Tab 导航 (Rankings, Stats, Mine)
 * - 深色主题
 * - Exit 按钮返回主 App
 */

import { Tabs } from "expo-router";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================
// 品牌色常量 (Stats.fm 风格)
// ============================================
const COLORS = {
    background: "#09090b",
    surface: "#18181b",
    surfaceLight: "#27272a",
    border: "#3f3f46",
    primary: "#1db954",      // Spotify Green
    secondary: "#8b5cf6",    // Purple
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
};

// ============================================
// Tab 图标组件
// ============================================

interface TabIconProps {
    emoji: string;
    label: string;
    focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
    return (
        <View style={styles.tabIconContainer}>
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
                {emoji}
            </Text>
            {focused && <View style={styles.tabIndicator} />}
        </View>
    );
}

// ============================================
// 自定义 Header 组件
// ============================================

function MusicVibeHeader() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable
                onPress={() => router.replace("/(tabs)/home")}
                style={styles.exitButton}
            >
                <Text style={styles.exitButtonText}>← Exit</Text>
            </Pressable>

            <View style={styles.headerCenter}>
                <Text style={styles.headerEmoji}>🎵</Text>
                <Text style={styles.headerTitle}>Music Vibe</Text>
            </View>

            <View style={styles.headerSpacer} />
        </View>
    );
}

// ============================================
// Tab Bar 背景
// ============================================

function TabBarBackground() {
    return (
        <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
        >
            <View style={styles.tabBarOverlay} />
        </BlurView>
    );
}

// ============================================
// MusicVibeLayout 主组件
// ============================================

export default function MusicVibeLayout() {
    return (
        <View style={styles.container}>
            <MusicVibeHeader />

            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarBackground: () => <TabBarBackground />,
                    tabBarStyle: {
                        position: "absolute",
                        backgroundColor: "transparent",
                        borderTopWidth: 0,
                        elevation: 0,
                        height: Platform.OS === "ios" ? 85 : 65,
                        paddingBottom: Platform.OS === "ios" ? 25 : 8,
                        paddingTop: 8,
                    },
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textMuted,
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: "600",
                        marginTop: 2,
                    },
                }}
            >
                <Tabs.Screen
                    name="rankings"
                    options={{
                        title: "Rankings",
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                emoji="🏆"
                                label="Rankings"
                                focused={focused}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="stats"
                    options={{
                        title: "Stats",
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                emoji="📊"
                                label="Stats"
                                focused={focused}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="mine"
                    options={{
                        title: "Mine",
                        tabBarActiveTintColor: COLORS.secondary,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                emoji="⛏️"
                                label="Mine"
                                focused={focused}
                            />
                        ),
                    }}
                />
                {/* 隐藏详情页路由 - 不在 Tab 栏显示 */}
                <Tabs.Screen
                    name="detail/[type]/[id]"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        </View>
    );
}

// ============================================
// 样式
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    exitButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 8,
    },
    exitButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerEmoji: {
        fontSize: 24,
        marginRight: 8,
    },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: "700",
    },
    headerSpacer: {
        width: 70,
    },
    tabIconContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 4,
    },
    tabEmoji: {
        fontSize: 22,
        opacity: 0.6,
    },
    tabEmojiActive: {
        opacity: 1,
        transform: [{ scale: 1.1 }],
    },
    tabIndicator: {
        position: "absolute",
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
    },
    tabBarOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(9, 9, 11, 0.92)",
        borderTopWidth: 1,
        borderTopColor: "rgba(63, 63, 70, 0.5)",
    },
});
