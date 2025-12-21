/**
 * app/index.native.tsx - Native 平台入口路由
 * 
 * 根据用户认证状态决定跳转方向。
 */

import { View, ActivityIndicator, Text } from "react-native";
import { Redirect } from "expo-router";
import { usePrivy } from "@privy-io/expo";

/**
 * IndexScreen - Native 入口路由组件
 */
export default function IndexScreen() {
    const { user, isReady } = usePrivy();

    // Privy 还在初始化，显示加载状态
    if (!isReady) {
        return (
            <View className="flex-1 items-center justify-center bg-dark-50">
                <ActivityIndicator size="large" color="#9333ea" />
                <Text className="text-gray-400 mt-4">正在启动...</Text>
            </View>
        );
    }

    // 已登录 -> 进入主页
    if (user) {
        return <Redirect href="/(tabs)/home" />;
    }

    // 未登录 -> 进入登录页
    return <Redirect href="/login" />;
}
