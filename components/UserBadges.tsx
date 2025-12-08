import { useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator, Pressable, Linking } from "react-native";
import { useEmbeddedWallet } from "@privy-io/expo";
import { publicClient, MUSIC_CONSENSUS_SBT_ADDRESS } from "../lib/web3/client";
import { MusicConsensusSBTAbi } from "../lib/web3/abi";
import { BadgeSkeleton } from "./ui/Skeleton";

// ============================================
// 流派信息
// ============================================

const GENRE_INFO: Record<number, { name: string; emoji: string; color: string }> = {
    1: { name: "Pop", emoji: "🎤", color: "#FF69B4" },
    2: { name: "Rock", emoji: "🎸", color: "#DC143C" },
    3: { name: "Hip-Hop", emoji: "🎧", color: "#FFD700" },
    4: { name: "R&B", emoji: "💜", color: "#9370DB" },
    5: { name: "Electronic", emoji: "🎹", color: "#00CED1" },
    6: { name: "Jazz", emoji: "🎷", color: "#8B4513" },
    7: { name: "Classical", emoji: "🎻", color: "#4169E1" },
    8: { name: "Country", emoji: "🤠", color: "#DAA520" },
    9: { name: "Indie", emoji: "🌙", color: "#708090" },
    10: { name: "Metal", emoji: "🤘", color: "#2F4F4F" },
};

// ============================================
// UserBadges 组件
// ============================================

export default function UserBadges() {
    const wallet = useEmbeddedWallet();
    const [badges, setBadges] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * 获取用户徽章
     */
    const fetchBadges = useCallback(async () => {
        if (!wallet.account?.address) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await publicClient.readContract({
                address: MUSIC_CONSENSUS_SBT_ADDRESS,
                abi: MusicConsensusSBTAbi,
                functionName: "getUserBadges",
                args: [wallet.account.address as `0x${string}`],
            });

            // 转换 BigInt 数组为 number 数组
            const badgeIds = (result as bigint[]).map((id) => Number(id));
            setBadges(badgeIds);
        } catch (err) {
            console.error("获取徽章失败:", err);
            setError("无法加载徽章");
        } finally {
            setLoading(false);
        }
    }, [wallet.account?.address]);

    // 首次加载
    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    // 钱包未连接
    if (!wallet.account?.address) {
        return null;
    }

    // 加载中 - 使用骨架屏
    if (loading) {
        return (
            <View className="bg-dark-200 rounded-2xl p-6">
                <View className="flex-row items-center mb-4">
                    <Text className="text-2xl mr-3">🏆</Text>
                    <Text className="text-white text-lg font-semibold">我的音乐徽章</Text>
                </View>
                <BadgeSkeleton />
            </View>
        );
    }

    // 错误状态
    if (error) {
        return (
            <View className="bg-dark-200 rounded-2xl p-6">
                <View className="flex-row items-center mb-4">
                    <Text className="text-2xl mr-3">🏆</Text>
                    <Text className="text-white text-lg font-semibold">我的音乐徽章</Text>
                </View>
                <Text className="text-red-400 text-center">{error}</Text>
                <Pressable onPress={fetchBadges} className="mt-3">
                    <Text className="text-primary-400 text-center">重试</Text>
                </Pressable>
            </View>
        );
    }

    // 无徽章
    if (badges.length === 0) {
        return (
            <View className="bg-dark-200 rounded-2xl p-6">
                <View className="flex-row items-center mb-4">
                    <Text className="text-2xl mr-3">🏆</Text>
                    <Text className="text-white text-lg font-semibold">我的音乐徽章</Text>
                </View>
                <Text className="text-gray-400 text-center">暂无徽章</Text>
                <Text className="text-gray-500 text-sm text-center mt-2">
                    连接 Spotify 并验证后可获得音乐流派徽章
                </Text>
            </View>
        );
    }

    // 显示徽章
    return (
        <View className="bg-dark-200 rounded-2xl p-6">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">🏆</Text>
                    <Text className="text-white text-lg font-semibold">我的音乐徽章</Text>
                </View>
                <Pressable onPress={fetchBadges}>
                    <Text className="text-gray-400 text-sm">刷新</Text>
                </Pressable>
            </View>

            {/* 徽章网格 */}
            <View className="flex-row flex-wrap gap-3">
                {badges.map((genreId) => {
                    const info = GENRE_INFO[genreId] || {
                        name: `#${genreId}`,
                        emoji: "🎵",
                        color: "#a855f7"
                    };

                    return (
                        <View
                            key={genreId}
                            className="items-center p-4 rounded-xl"
                            style={{ backgroundColor: `${info.color}20` }}
                        >
                            <Text className="text-3xl mb-2">{info.emoji}</Text>
                            <Text
                                className="font-semibold text-sm"
                                style={{ color: info.color }}
                            >
                                {info.name}
                            </Text>
                            <Text className="text-gray-500 text-xs mt-1">SBT #{genreId}</Text>
                        </View>
                    );
                })}
            </View>

            {/* 区块链链接 */}
            <Pressable
                onPress={() =>
                    Linking.openURL(
                        `https://sepolia.basescan.org/address/${wallet.account?.address}#tokentxnsErc1155`
                    )
                }
                className="mt-4"
            >
                <Text className="text-primary-400 text-sm text-center">
                    在区块浏览器查看 →
                </Text>
            </Pressable>
        </View>
    );
}
