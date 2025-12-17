/**
 * app/login.tsx - 登录页面
 * 
 * 这是用户进入应用后看到的第一个页面（如果未登录）。
 * 实现了霓虹风格的 UI 和 Google OAuth 登录逻辑。
 * 
 * 注意：Web 和 Native 平台使用不同的 Privy SDK
 */

import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { usePrivyUnified, useLoginWithOAuthUnified } from "../hooks/usePrivyUnified";

// Web SDK 的额外导入
let useLoginWeb: any = null;
if (Platform.OS === "web") {
    // 动态导入 Web SDK 的 login hook
    const webAuth = require("@privy-io/react-auth");
    useLoginWeb = webAuth.useLogin;
}

/**
 * LoginScreen - 登录页面组件
 * 
 * 核心逻辑：
 * 1. 使用统一 hooks 触发登录
 * 2. 监听用户状态
 * 3. 用户登录成功后自动跳转到主页
 */
export default function LoginScreen() {
    const router = useRouter();

    // 统一的 Privy Hook - 获取当前用户状态
    const { isReady, user } = usePrivyUnified();

    // 统一的 OAuth 登录 Hook（仅用于 Native）
    const { login: nativeLogin, state } = useLoginWithOAuthUnified();

    // Web 平台使用 useLogin hook
    const webLoginHook = Platform.OS === "web" && useLoginWeb ? useLoginWeb() : null;

    // 本地 loading 状态
    const [isLoading, setIsLoading] = useState(false);

    /**
     * 监听用户状态变化
     * 当 user 不为空时，表示登录成功，自动跳转到主页
     */
    useEffect(() => {
        if (isReady && user) {
            // 使用 replace 而不是 push，这样用户无法返回登录页
            router.replace("/(tabs)/home");
        }
    }, [isReady, user, router]);

    /**
     * 处理登录
     * 根据平台使用不同的登录方式
     */
    const handleLogin = async () => {
        try {
            setIsLoading(true);

            if (Platform.OS === "web") {
                // Web 平台: 使用 @privy-io/react-auth 的 login
                // 这会弹出 Privy 的登录模态框
                if (webLoginHook?.login) {
                    await webLoginHook.login();
                }
            } else {
                // Native 平台: 使用 @privy-io/expo 的 OAuth 登录
                await nativeLogin();
            }
        } catch (error) {
            console.error("登录失败:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 在 Privy 初始化完成前显示加载状态
    if (!isReady) {
        return (
            <View className="flex-1 items-center justify-center bg-dark-50">
                <ActivityIndicator size="large" color="#9333ea" />
                <Text className="text-gray-400 mt-4">正在初始化...</Text>
            </View>
        );
    }

    // 判断是否正在登录中
    const isLoginInProgress = isLoading || state.status === "loading";

    return (
        <View className="flex-1 items-center justify-center bg-dark-50 px-8">
            {/* Logo 和标题区域 */}
            <View className="items-center mb-16">
                <Text className="text-6xl mb-4">🎵</Text>
                <Text className="text-white text-4xl font-bold mb-2">
                    VibeConsensus
                </Text>
                <Text className="text-gray-400 text-lg text-center">
                    Prove your music taste, on-chain.
                </Text>
            </View>

            {/* 霓虹风格登录按钮 */}
            <Pressable
                onPress={handleLogin}
                disabled={isLoginInProgress}
                className={`
          w-full py-4 px-8 rounded-2xl
          ${isLoginInProgress ? "bg-gray-700" : "bg-primary-600"}
          shadow-lg
        `}
                style={({ pressed }) => [
                    {
                        // 霓虹光效 - 按钮阴影
                        shadowColor: "#9333ea",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: pressed ? 0.8 : 0.5,
                        shadowRadius: pressed ? 20 : 15,
                        elevation: 10,
                        // 按压效果
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                ]}
            >
                <View className="flex-row items-center justify-center">
                    {isLoginInProgress ? (
                        <>
                            <ActivityIndicator size="small" color="#ffffff" />
                            <Text className="text-white text-lg font-semibold ml-3">
                                正在连接...
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-2xl mr-3">✨</Text>
                            <Text className="text-white text-lg font-semibold">
                                开启共识之旅
                            </Text>
                        </>
                    )}
                </View>
            </Pressable>

            {/* 底部说明文字 */}
            <View className="mt-8 items-center">
                <Text className="text-gray-500 text-sm text-center">
                    使用 Google 账号登录{"\n"}
                    我们将为您自动创建 Web3 钱包
                </Text>
            </View>

            {/* 登录失败提示 */}
            {state.status === "error" && (
                <View className="mt-4 bg-red-900/30 px-4 py-2 rounded-lg">
                    <Text className="text-red-400 text-center">
                        登录失败，请重试
                    </Text>
                </View>
            )}
        </View>
    );
}

