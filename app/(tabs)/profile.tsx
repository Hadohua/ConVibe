/**
 * app/(tabs)/profile.tsx - 个人资料页 (简化版)
 * 
 * 简化为基础用户设置页：
 * - 钱包信息
 * - 关联账户
 * - 登出功能
 * 
 * Web3 音乐资产管理已迁移至 Music Vibe > Mine
 */

import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { usePrivyUnified, useEmbeddedWalletUnified, useLogoutUnified } from "../../hooks/usePrivyUnified";
import { SkeletonText, SkeletonCard } from "../../components/ui/Skeleton";

/**
 * ProfileScreen - 个人资料页组件 (简化版)
 */
export default function ProfileScreen() {
    const router = useRouter();
    const { user, isReady } = usePrivyUnified();
    const { wallet } = useEmbeddedWalletUnified();
    const { logout } = useLogoutUnified();

    /**
     * 处理登出
     */
    const handleLogout = async () => {
        Alert.alert(
            "确认登出",
            "你确定要退出登录吗？",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "登出",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace("/login");
                        } catch (error: unknown) {
                            const errorMessage = error instanceof Error ? error.message : "未知错误";
                            Alert.alert("登出失败", errorMessage);
                        }
                    },
                },
            ]
        );
    };

    /**
     * 复制钱包地址
     */
    const handleCopyAddress = async () => {
        const address = Platform.OS === "web"
            ? (wallet as any).address
            : (wallet as any).account?.address;
        if (address) {
            await Clipboard.setStringAsync(address);
            Alert.alert("✅ 已复制", "钱包地址已复制到剪贴板");
        }
    };

    // 获取所有关联账户 - Web 和 Native 的 user 结构不同
    const linkedAccounts = ((user as any)?.linked_accounts || (user as any)?.linkedAccounts || []) as Array<{
        type: string;
        email?: string;
    }>;

    // 未就绪时显示骨架屏
    if (!isReady) {
        return (
            <ScrollView className="flex-1 bg-vibe-black">
                <View className="px-6 pt-16 pb-32">
                    <Text className="text-white text-3xl font-bold mb-8">设置</Text>
                    <SkeletonCard style={{ marginBottom: 24 }} />
                    <SkeletonCard style={{ marginBottom: 24 }} />
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView className="flex-1 bg-vibe-black">
            <View className="px-6 pt-16 pb-32">
                {/* 页面标题 */}
                <View className="flex-row items-center mb-8">
                    <Text className="text-white text-4xl mr-3">⚙️</Text>
                    <Text className="text-white text-3xl font-bold">设置</Text>
                </View>

                {/* 快速入口 - Music Vibe */}
                <Pressable
                    onPress={() => router.push("/(music-vibe)/mine")}
                    className="bg-vibe-purple/20 rounded-2xl p-5 mb-6 border border-vibe-purple/40"
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Text className="text-3xl mr-3">🎵</Text>
                            <View>
                                <Text className="text-white text-lg font-semibold">Music Vibe</Text>
                                <Text className="text-gray-400 text-sm">管理你的 Web3 音乐资产</Text>
                            </View>
                        </View>
                        <Text className="text-vibe-purple text-2xl">→</Text>
                    </View>
                </Pressable>

                {/* 钱包信息 */}
                <View className="bg-dark-200 rounded-2xl p-6 mb-6 border border-dark-300">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-2xl mr-3">💳</Text>
                        <Text className="text-white text-lg font-semibold">钱包信息</Text>
                    </View>

                    {wallet.status === "connected" && (Platform.OS === "web" ? (wallet as any).address : (wallet as any).account?.address) ? (
                        <View>
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-gray-400 text-sm">类型</Text>
                                <View className="bg-vibe-purple/20 px-3 py-1 rounded-full">
                                    <Text className="text-vibe-purple text-sm font-medium">嵌入式钱包</Text>
                                </View>
                            </View>

                            <View>
                                <Text className="text-gray-400 text-sm mb-2">地址</Text>
                                <View className="flex-row items-center">
                                    <View className="bg-dark-50 rounded-lg p-3 flex-1">
                                        <Text className="text-vibe-purple font-mono text-xs">
                                            {Platform.OS === "web" ? (wallet as any).address : (wallet as any).account?.address}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={handleCopyAddress}
                                        className="bg-vibe-purple/20 ml-2 px-3 py-3 rounded-lg"
                                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                                    >
                                        <Text className="text-vibe-purple text-sm">📋 复制</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    ) : wallet.status === "connecting" ? (
                        <View>
                            <SkeletonText width="40%" height={14} style={{ marginBottom: 12 }} />
                            <SkeletonText width="100%" height={40} />
                        </View>
                    ) : wallet.status === "not-created" ? (
                        <Text className="text-gray-400">钱包尚未创建</Text>
                    ) : (
                        <Text className="text-gray-400">无钱包信息</Text>
                    )}
                </View>

                {/* 关联账户列表 */}
                <View className="bg-dark-200 rounded-2xl p-6 mb-6 border border-dark-300">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-2xl mr-3">🔗</Text>
                        <Text className="text-white text-lg font-semibold">关联账户</Text>
                    </View>

                    {linkedAccounts.length > 0 ? (
                        linkedAccounts.map((account, index) => (
                            <View
                                key={index}
                                className={`py-3 ${index > 0 ? "border-t border-dark-300" : ""}`}
                            >
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-400 capitalize">
                                        {account.type === "google_oauth" ? "🔵 Google" :
                                            account.type === "email" ? "📧 Email" :
                                                account.type}
                                    </Text>
                                    {account.email && (
                                        <Text className="text-white text-sm">{account.email}</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-400">无关联账户</Text>
                    )}
                </View>

                {/* Privy ID */}
                <View className="bg-dark-200 rounded-2xl p-6 mb-6 border border-dark-300">
                    <Text className="text-gray-500 text-xs mb-2">Privy 用户 ID</Text>
                    <Text className="text-gray-400 font-mono text-xs" numberOfLines={1}>
                        {user?.id || "未知"}
                    </Text>
                </View>

                {/* 登出按钮 */}
                <Pressable
                    onPress={handleLogout}
                    className="bg-red-900/30 border border-red-700/50 rounded-2xl py-4"
                    style={({ pressed }) => [
                        { opacity: pressed ? 0.8 : 1 },
                    ]}
                >
                    <Text className="text-red-400 text-center text-lg font-semibold">
                        退出登录
                    </Text>
                </Pressable>

                {/* 版本信息 */}
                <Text className="text-gray-600 text-center mt-8 text-sm">
                    VibeConsensus v1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}
