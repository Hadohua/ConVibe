/**
 * app/(music-vibe)/(tabs)/_layout.tsx - Tabs 布局
 * 
 * Stats.fm 风格的底部导航：
 * - Rankings, Stats, Mine 三个 Tab
 * - 自定义 Header 带 Exit 按钮
 * - 深色主题
 */

import { Tabs } from "expo-router";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
    icon: keyof typeof Ionicons.glyphMap;
    focused: boolean;
}

function TabIcon({ icon, focused }: TabIconProps) {
    return (
        <View style={styles.tabIconContainer}>
            <Ionicons
                name={icon}
                size={24}
                color={focused ? COLORS.primary : COLORS.textMuted}
            />
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
// TabsLayout 主组件
// ============================================

export default function MusicVibeTabsLayout() {
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
                            <TabIcon icon="trophy-outline" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="stats"
                    options={{
                        title: "Stats",
                        tabBarIcon: ({ focused }) => (
                            <TabIcon icon="stats-chart-outline" focused={focused} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="mine"
                    options={{
                        title: "Mine",
                        tabBarActiveTintColor: COLORS.secondary,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon icon="cube-outline" focused={focused} />
                        ),
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
