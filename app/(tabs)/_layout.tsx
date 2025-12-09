/**
 * app/(tabs)/_layout.tsx - Tab 路由组布局
 * 
 * 这个文件定义了受保护的 Tab 导航区域。
 * 使用 AuthBoundary 确保只有已登录用户才能访问。
 * 
 * 特性：
 * - 毛玻璃效果 TabBar
 * - 自定义高亮图标
 * - 选中时发光效果
 */

import { Tabs, Redirect } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { AuthBoundary } from "@privy-io/expo";
import { BlurView } from "expo-blur";

// ============================================
// 品牌色常量
// ============================================
const COLORS = {
    vibeBlack: "#09090b",
    vibeGreen: "#1db954",
    vibePurple: "#8b5cf6",
    vibeGold: "#fbbf24",
    dark50: "#18181b",
    dark200: "#27272a",
    gray400: "#a1a1aa",
    gray500: "#71717a",
};

// ============================================
// Tab 图标组件
// ============================================

interface TabIconProps {
    emoji: string;
    label: string;
    focused: boolean;
    color: string;
}

function TabIcon({ emoji, focused, color }: TabIconProps) {
    return (
        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
            <Text style={[styles.iconText, { color }]}>{emoji}</Text>
            {focused && <View style={[styles.glowDot, { backgroundColor: color }]} />}
        </View>
    );
}

// ============================================
// 加载和错误组件
// ============================================

function FullScreenLoader() {
    return (
        <View className="flex-1 items-center justify-center bg-vibe-black">
            <ActivityIndicator size="large" color={COLORS.vibePurple} />
            <Text className="text-gray-400 mt-4">正在验证身份...</Text>
        </View>
    );
}

function ErrorScreen({ error }: { error: Error }) {
    return (
        <View className="flex-1 items-center justify-center bg-vibe-black px-8">
            <Text className="text-red-400 text-xl font-bold mb-4">⚠️ 认证错误</Text>
            <Text className="text-gray-400 text-center">{error.message}</Text>
        </View>
    );
}

// ============================================
// 自定义 TabBar 背景
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
// TabLayout 主组件
// ============================================

export default function TabLayout() {
    return (
        <AuthBoundary
            loading={<FullScreenLoader />}
            error={(error) => <ErrorScreen error={error} />}
            unauthenticated={<Redirect href="/login" />}
        >
            <Tabs
                screenOptions={{
                    headerShown: false,
                    // 使用毛玻璃背景
                    tabBarBackground: () => <TabBarBackground />,
                    tabBarStyle: {
                        position: "absolute",
                        backgroundColor: "transparent",
                        borderTopWidth: 0,
                        elevation: 0,
                        height: Platform.OS === "ios" ? 88 : 70,
                        paddingBottom: Platform.OS === "ios" ? 28 : 10,
                        paddingTop: 10,
                    },
                    tabBarActiveTintColor: COLORS.vibePurple,
                    tabBarInactiveTintColor: COLORS.gray500,
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: "600",
                        marginTop: 2,
                    },
                }}
            >
                {/* 主页 Tab */}
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "主页",
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon emoji="🏠" label="主页" focused={focused} color={color} />
                        ),
                    }}
                />

                {/* 隐藏的页面 (不在 Tab 栏显示，但保留路由) */}
                <Tabs.Screen
                    name="feed"
                    options={{
                        href: null, // 隐藏此 Tab
                    }}
                />
                <Tabs.Screen
                    name="stats"
                    options={{
                        href: null, // 隐藏此 Tab
                    }}
                />
                <Tabs.Screen
                    name="verify-spotify"
                    options={{
                        href: null, // 隐藏此 Tab
                    }}
                />

                {/* 个人资料 Tab */}
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "我的",
                        tabBarActiveTintColor: COLORS.vibeGold,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                emoji="👤"
                                label="我的"
                                focused={focused}
                                color={focused ? COLORS.vibeGold : color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </AuthBoundary>
    );
}

// ============================================
// 样式
// ============================================

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 4,
    },
    iconContainerActive: {
        transform: [{ scale: 1.1 }],
    },
    iconText: {
        fontSize: 22,
    },
    glowDot: {
        position: "absolute",
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
        // 发光效果
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 8,
    },
    tabBarOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(9, 9, 11, 0.85)",
        borderTopWidth: 1,
        borderTopColor: "rgba(63, 63, 70, 0.5)",
    },
});
