/**
 * app/_layout.tsx - Expo Router 根布局文件
 * 
 * 这个文件是整个应用的"骨架"，负责：
 * 1. 加载全局样式
 * 2. 用 PrivyProviderWrapper 包裹整个应用（根据平台自动选择正确的 Privy SDK）
 * 3. 配置全局导航行为
 */

// 导入全局 CSS - 这行必须在应用入口处，确保 Tailwind 样式生效
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { PrivyProviderWrapper } from "../components/providers/PrivyProviderWrapper";

/**
 * RootLayout - 根布局组件
 * 
 * 职责：
 * 1. 初始化 Privy 身份认证系统（根据平台自动选择 Web 或 Native SDK）
 * 2. 设置全局深色主题背景
 * 3. 配置 Stack 导航器（堆栈式页面切换）
 * 
 * 关于 PrivyProviderWrapper：
 * - Web 平台: 使用 @privy-io/react-auth
 * - Native 平台: 使用 @privy-io/expo
 */
export default function RootLayout() {
    return (
        // PrivyProviderWrapper 根据平台自动选择正确的 Provider
        <PrivyProviderWrapper>
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
        </PrivyProviderWrapper>
    );
}

