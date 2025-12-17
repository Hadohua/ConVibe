/**
 * app/index.tsx - 应用入口路由
 * 
 * 这是应用的根路由 "/"。
 * 它的职责是根据用户认证状态决定跳转方向：
 * - 已登录 -> 主页
 * - 未登录 -> 登录页
 */

import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { usePrivyUnified } from "../hooks/usePrivyUnified";

/**
 * IndexScreen - 入口路由组件
 * 
 * 这个组件只是一个"路由分发器"，不显示任何实际内容。
 * 根据 Privy 的认证状态，将用户重定向到正确的页面。
 */
export default function IndexScreen() {
    const { isReady, user } = usePrivyUnified();

    // Privy 还在初始化，显示加载状态
    if (!isReady) {
        return (
            <View className="flex-1 items-center justify-center bg-dark-50">
                <ActivityIndicator size="large" color="#9333ea" />
                <Text className="text-gray-400 mt-4">正在启动...</Text>
            </View>
        );
    }

    // 根据登录状态重定向
    // 已登录 -> 进入主页
    if (user) {
        return <Redirect href="/(tabs)/home" />;
    }

    // 未登录 -> 进入登录页
    return <Redirect href="/login" />;
}
