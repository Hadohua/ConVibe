/**
 * app/_layout.tsx - Expo Router 根布局文件
 * 
 * 这个文件是整个应用的"骨架"，负责：
 * 1. 加载全局样式
 * 2. 用 PrivyProvider 包裹整个应用（身份认证的核心）
 * 3. 配置全局导航行为
 */

// 导入全局 CSS - 这行必须在应用入口处，确保 Tailwind 样式生效
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { PrivyProvider } from "@privy-io/expo";
import { getPrivyAppId, getPrivyClientId, privyConfig } from "../lib/web3/privy-config";

/**
 * 加载状态组件
 * 在 Privy 初始化期间显示
 */
function LoadingScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-dark-50">
            <ActivityIndicator size="large" color="#9333ea" />
            <Text className="text-gray-400 mt-4">正在初始化...</Text>
        </View>
    );
}

/**
 * RootLayout - 根布局组件
 * 
 * 职责：
 * 1. 初始化 Privy 身份认证系统
 * 2. 设置全局深色主题背景
 * 3. 配置 Stack 导航器（堆栈式页面切换）
 * 
 * 关于 PrivyProvider：
 * - 它是整个应用的"状态心脏"，管理用户的认证状态和钱包
 * - appId 和 clientId 从环境变量读取，在 Privy Dashboard 中创建
 * - config 中的 embeddedWallets 配置决定了钱包创建策略
 */
export default function RootLayout() {
    const appId = getPrivyAppId();
    const clientId = getPrivyClientId();

    // 如果没有配置 Privy 凭证，显示警告
    if (!appId || !clientId) {
        return (
            <View className="flex-1 items-center justify-center bg-dark-50 px-8">
                <StatusBar style="light" />
                <Text className="text-white text-xl font-bold mb-4">⚠️ 配置缺失</Text>
                <Text className="text-gray-400 text-center">
                    请在 .env 文件中配置 Privy 凭证：{"\n\n"}
                    EXPO_PUBLIC_PRIVY_APP_ID{"\n"}
                    EXPO_PUBLIC_PRIVY_CLIENT_ID{"\n\n"}
                    获取方式：https://dashboard.privy.io
                </Text>
            </View>
        );
    }

    return (
        // PrivyProvider 包裹整个应用
        // 所有子组件都可以通过 usePrivy() Hook 访问认证状态
        <PrivyProvider
            appId={appId}
            clientId={clientId}
        // config 目前为空，因为 embeddedWallets 配置需要在 Dashboard 设置
        // 未来版本可能支持在代码中配置
        >
            {/* flex-1 让容器填满整个屏幕，bg-dark-50 应用深色背景 */}
            <View className="flex-1 bg-dark-50">
                {/* 
          StatusBar 控制手机顶部状态栏的样式
          light 表示白色图标，适合深色背景
        */}
                <StatusBar style="light" />

                {/* 
          Stack 是 Expo Router 提供的堆栈导航器
          页面像"卡片"一样叠加，新页面从右侧滑入
        */}
                <Stack
                    screenOptions={{
                        // 隐藏默认的导航头部（我们会自定义）
                        headerShown: false,
                        // 设置所有页面内容区域的背景色为透明
                        contentStyle: {
                            backgroundColor: "transparent",
                        },
                        // 页面切换动画
                        animation: "slide_from_right",
                    }}
                />
            </View>
        </PrivyProvider>
    );
}
