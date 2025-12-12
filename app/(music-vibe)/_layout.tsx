/**
 * app/(music-vibe)/_layout.tsx - Music Vibe 模块根布局
 * 
 * 使用 Stack 导航器作为根容器：
 * - (tabs) 子路由包含 Rankings, Stats, Mine
 * - detail/[type]/[id] 详情页作为独立 Stack 页面
 * - 支持左滑返回和标准 Push 动画
 */

import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

// ============================================
// 品牌色常量
// ============================================
const COLORS = {
    background: "#09090b",
};

// ============================================
// MusicVibeLayout 主组件
// ============================================

export default function MusicVibeLayout() {
    return (
        <View style={styles.container}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                }}
            >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="detail/[type]/[id]" />
            </Stack>
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
});
