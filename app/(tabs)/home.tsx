/**
 * app/(tabs)/home.tsx - 主页
 * 
 * 用户登录成功后看到的第一个页面。
 * 展示用户信息和钱包地址，证明"无感接入"成功。
 */

import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { usePrivy, useEmbeddedWallet } from "@privy-io/expo";
import UserBadges from "../../components/UserBadges";

/**
 * HomeScreen - 主页组件
 */
export default function HomeScreen() {
    // 获取当前用户信息
    const { user } = usePrivy();

    // 获取嵌入式钱包
    const wallet = useEmbeddedWallet();

    // 手动创建钱包的状态
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // 获取用户的主要登录账户（Google）
    const linkedAccounts = user?.linked_accounts || [];
    const primaryAccount = linkedAccounts[0];

    // 调试：打印钱包状态和用户信息
    useEffect(() => {
        console.log("=== 钱包调试信息 ===");
        console.log("钱包状态:", wallet.status);
        console.log("用户 ID:", user?.id);
        console.log("=====================");
    }, [wallet.status, user]);

    /**
     * 复制钱包地址
     */
    const handleCopyAddress = async () => {
        if (wallet.account?.address) {
            await Clipboard.setStringAsync(wallet.account.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    /**
     * 手动创建钱包
     */
    const handleCreateWallet = async () => {
        try {
            setIsCreating(true);
            setCreateError(null);

            if (wallet.status === "not-created" && "create" in wallet) {
                console.log("开始手动创建钱包...");
                await (wallet as { create: () => Promise<void> }).create();
                console.log("钱包创建成功！");
            } else {
                console.log("钱包状态不支持创建:", wallet.status);
                setCreateError(`当前状态不支持创建: ${wallet.status}`);
            }
        } catch (error) {
            console.error("创建钱包失败:", error);
            setCreateError(error instanceof Error ? error.message : "创建失败");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-dark-50">
            <View className="px-6 pt-16 pb-8">
                {/* 欢迎区域 */}
                <View className="mb-8">
                    <Text className="text-gray-400 text-lg">欢迎回来 👋</Text>
                    <Text className="text-white text-3xl font-bold mt-2">
                        VibeConsensus
                    </Text>
                </View>

                {/* 钱包信息卡片 */}
                <View className="bg-dark-200 rounded-2xl p-6 mb-6">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-2xl mr-3">💳</Text>
                        <Text className="text-white text-lg font-semibold">
                            你的 Web3 钱包
                        </Text>
                    </View>

                    {wallet.status === "connected" && wallet.account ? (
                        <>
                            <Text className="text-gray-400 text-sm mb-2">钱包地址</Text>
                            <Pressable
                                onPress={handleCopyAddress}
                                className="bg-dark-50 rounded-lg p-3 flex-row items-center justify-between"
                                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                            >
                                <Text
                                    className="text-primary-400 font-mono text-sm flex-1"
                                    numberOfLines={1}
                                >
                                    {wallet.account.address}
                                </Text>
                                <Text className="text-gray-400 ml-2">
                                    {copied ? "✓ 已复制" : "📋 复制"}
                                </Text>
                            </Pressable>
                            <Text className="text-gray-500 text-xs mt-3 text-center">
                                ✨ 点击地址可复制
                            </Text>
                        </>
                    ) : wallet.status === "connecting" ? (
                        <View className="items-center py-4">
                            <ActivityIndicator size="small" color="#9333ea" />
                            <Text className="text-gray-400 mt-2">正在连接钱包...</Text>
                        </View>
                    ) : wallet.status === "not-created" ? (
                        <View>
                            <Text className="text-gray-400 mb-3">钱包尚未创建</Text>

                            <Pressable
                                onPress={handleCreateWallet}
                                disabled={isCreating}
                                className={`py-3 px-4 rounded-xl ${isCreating ? "bg-gray-700" : "bg-primary-600"}`}
                            >
                                {isCreating ? (
                                    <View className="flex-row items-center justify-center">
                                        <ActivityIndicator size="small" color="#ffffff" />
                                        <Text className="text-white ml-2">创建中...</Text>
                                    </View>
                                ) : (
                                    <Text className="text-white text-center font-semibold">
                                        🔐 创建钱包
                                    </Text>
                                )}
                            </Pressable>

                            {createError && (
                                <Text className="text-red-400 text-xs mt-2 text-center">
                                    {createError}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text className="text-gray-400">
                            正在加载钱包信息... (状态: {wallet.status})
                        </Text>
                    )}
                </View>

                {/* 用户徽章 */}
                <View className="mb-6">
                    <UserBadges />
                </View>

                {/* 账户信息卡片 */}
                <View className="bg-dark-200 rounded-2xl p-6 mb-6">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-2xl mr-3">👤</Text>
                        <Text className="text-white text-lg font-semibold">
                            账户信息
                        </Text>
                    </View>

                    {primaryAccount ? (
                        <View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-400">登录方式</Text>
                                <Text className="text-white capitalize">
                                    {primaryAccount.type === "google_oauth" ? "Google" : primaryAccount.type}
                                </Text>
                            </View>

                            {"email" in primaryAccount && (
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-gray-400">邮箱</Text>
                                    <Text className="text-white">{String(primaryAccount.email)}</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text className="text-gray-400">正在加载账户信息...</Text>
                    )}
                </View>

                {/* 快速操作卡片 */}
                <View className="bg-primary-900/50 rounded-2xl p-6 border border-primary-700/50">
                    <Text className="text-white text-lg font-semibold mb-3">
                        🎵 开始使用
                    </Text>
                    <Text className="text-gray-300 leading-5 mb-4">
                        1️⃣ 前往"验证"页面连接 Spotify
                        {"\n"}
                        2️⃣ 获取你的音乐流派数据
                        {"\n"}
                        3️⃣ 铸造链上 SBT 徽章
                    </Text>
                    <View className="bg-primary-700/30 rounded-lg p-3">
                        <Text className="text-primary-300 text-sm text-center">
                            💡 点击底部 Tab 栏的 "🎵 验证" 开始
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
