/**
 * components/UserBadges.tsx - 用户徽章展示组件 V2
 * 
 * 展示用户拥有的 SBT 徽章，包含等级和验证状态
 * 
 * V2 新增：
 * - 显示徽章等级 (入门/资深/OG)
 * - 显示验证状态 (活跃/需要重新验证)
 * - 不同等级的视觉差异化
 */

import { useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator, Pressable, Linking } from "react-native";
import { useEmbeddedWallet } from "@privy-io/expo";
import { publicClient, MUSIC_CONSENSUS_SBT_ADDRESS } from "../lib/web3/client";
import { MusicConsensusSBTAbi } from "../lib/web3/abi";
import { BadgeSkeleton } from "./ui/Skeleton";
import {
    TIER_INFO,
    getDaysUntilExpiry,
    type TierLevel,
} from "../lib/consensus/tier-calculator";

// ============================================
// 流派信息
// ============================================

const GENRE_INFO: Record<number, { name: string; emoji: string; baseColor: string }> = {
    1: { name: "Pop", emoji: "🎤", baseColor: "#FF69B4" },
    2: { name: "Rock", emoji: "🎸", baseColor: "#DC143C" },
    3: { name: "Hip-Hop", emoji: "🎧", baseColor: "#FFD700" },
    4: { name: "R&B", emoji: "💜", baseColor: "#9370DB" },
    5: { name: "Electronic", emoji: "🎹", baseColor: "#00CED1" },
    6: { name: "Jazz", emoji: "🎷", baseColor: "#8B4513" },
    7: { name: "Classical", emoji: "🎻", baseColor: "#4169E1" },
    8: { name: "Country", emoji: "🤠", baseColor: "#DAA520" },
    9: { name: "Indie", emoji: "🌙", baseColor: "#708090" },
    10: { name: "Metal", emoji: "🤘", baseColor: "#2F4F4F" },
};

// ============================================
// 类型定义
// ============================================

interface BadgeWithDetails {
    genreId: number;
    tier: TierLevel;
    isActive: boolean;
    lastVerified: number;
    isExpired: boolean;
}

interface UserBadgesProps {
    onRefreshNeeded?: (genreId: number) => void;
}

// ============================================
// 徽章卡片子组件
// ============================================

function BadgeCard({
    badge,
    onRefreshPress
}: {
    badge: BadgeWithDetails;
    onRefreshPress?: () => void;
}) {
    const genreInfo = GENRE_INFO[badge.genreId] || {
        name: `#${badge.genreId}`,
        emoji: "🎵",
        baseColor: "#a855f7"
    };

    const tierInfo = TIER_INFO[badge.tier];
    const daysLeft = getDaysUntilExpiry(badge.lastVerified);
    const needsRefresh = !badge.isActive || badge.isExpired || daysLeft < 14;

    // 根据等级设置边框和光晕样式
    const getBorderStyle = () => {
        if (badge.tier === 3) {
            // OG: 金色光晕
            return {
                borderWidth: 2,
                borderColor: "#FFD700",
                shadowColor: "#FFD700",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
            };
        } else if (badge.tier === 2) {
            // 资深: 银色边框
            return {
                borderWidth: 2,
                borderColor: "#C0C0C0",
            };
        }
        // 入门: 普通边框
        return {
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
        };
    };

    return (
        <View
            className="p-4 rounded-xl"
            style={[
                { backgroundColor: `${genreInfo.baseColor}15` },
                getBorderStyle(),
            ]}
        >
            {/* 等级标识 */}
            <View className="absolute -top-1 -right-1 z-10">
                <Text className="text-lg">{tierInfo.emoji}</Text>
            </View>

            {/* 主内容 */}
            <View className="items-center">
                <Text className="text-3xl mb-2">{genreInfo.emoji}</Text>
                <Text
                    className="font-semibold text-sm"
                    style={{ color: genreInfo.baseColor }}
                >
                    {genreInfo.name}
                </Text>

                {/* 等级标签 */}
                <View
                    className="mt-2 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${tierInfo.color}30` }}
                >
                    <Text
                        className="text-xs font-medium"
                        style={{ color: tierInfo.color }}
                    >
                        {tierInfo.name}
                    </Text>
                </View>

                {/* 验证状态 */}
                {needsRefresh ? (
                    <Pressable
                        onPress={onRefreshPress}
                        className="mt-2 px-2 py-1 bg-yellow-900/50 rounded"
                    >
                        <Text className="text-yellow-400 text-xs">
                            {badge.isExpired ? "已过期" : `${daysLeft}天后过期`}
                        </Text>
                    </Pressable>
                ) : (
                    <Text className="text-green-500 text-xs mt-2">
                        ✓ 活跃
                    </Text>
                )}
            </View>
        </View>
    );
}

// ============================================
// UserBadges 组件
// ============================================

export default function UserBadges({ onRefreshNeeded }: UserBadgesProps = {}) {
    const wallet = useEmbeddedWallet();
    const [badges, setBadges] = useState<BadgeWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * 获取用户徽章详细信息 V2
     */
    const fetchBadges = useCallback(async () => {
        if (!wallet.account?.address) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 尝试使用 V2 接口
            try {
                const result = await publicClient.readContract({
                    address: MUSIC_CONSENSUS_SBT_ADDRESS,
                    abi: MusicConsensusSBTAbi,
                    functionName: "getActiveBadgesWithInfo",
                    args: [wallet.account.address as `0x${string}`],
                });

                const [genreIds, tiers, isActives] = result as [bigint[], number[], boolean[]];

                const badgeDetails: BadgeWithDetails[] = [];

                for (let i = 0; i < genreIds.length; i++) {
                    const genreId = Number(genreIds[i]);

                    // 获取更多详情
                    const info = await publicClient.readContract({
                        address: MUSIC_CONSENSUS_SBT_ADDRESS,
                        abi: MusicConsensusSBTAbi,
                        functionName: "getBadgeInfo",
                        args: [wallet.account.address as `0x${string}`, BigInt(genreId)],
                    });

                    const [tier, lastVerified, , isExpired] = info as [number, bigint, number, boolean];

                    badgeDetails.push({
                        genreId,
                        tier: tier as TierLevel,
                        isActive: isActives[i],
                        lastVerified: Number(lastVerified),
                        isExpired,
                    });
                }

                setBadges(badgeDetails);
            } catch (v2Error) {
                // 回退到 V1 接口
                console.log("回退到 V1 接口", v2Error);

                const result = await publicClient.readContract({
                    address: MUSIC_CONSENSUS_SBT_ADDRESS,
                    abi: MusicConsensusSBTAbi,
                    functionName: "getUserBadges",
                    args: [wallet.account.address as `0x${string}`],
                });

                const badgeIds = (result as bigint[]).map((id) => Number(id));

                // V1 没有详细信息，使用默认值
                setBadges(badgeIds.map(genreId => ({
                    genreId,
                    tier: 1 as TierLevel,
                    isActive: true,
                    lastVerified: Math.floor(Date.now() / 1000),
                    isExpired: false,
                })));
            }
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

    // 加载中
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

    // 统计
    const activeCount = badges.filter(b => b.isActive && !b.isExpired).length;
    const ogCount = badges.filter(b => b.tier === 3).length;

    // 显示徽章
    return (
        <View className="bg-dark-200 rounded-2xl p-6">
            {/* 头部 */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">🏆</Text>
                    <View>
                        <Text className="text-white text-lg font-semibold">我的音乐徽章</Text>
                        <Text className="text-gray-500 text-xs">
                            {activeCount} 活跃 {ogCount > 0 && `• ${ogCount} OG`}
                        </Text>
                    </View>
                </View>
                <Pressable onPress={fetchBadges}>
                    <Text className="text-gray-400 text-sm">刷新</Text>
                </Pressable>
            </View>

            {/* 徽章网格 */}
            <View className="flex-row flex-wrap gap-3">
                {badges.map((badge) => (
                    <BadgeCard
                        key={badge.genreId}
                        badge={badge}
                        onRefreshPress={() => onRefreshNeeded?.(badge.genreId)}
                    />
                ))}
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

            {/* 等级说明 */}
            <View className="mt-4 pt-4 border-t border-dark-50">
                <Text className="text-gray-500 text-xs text-center">
                    🌱 入门 • ⭐ 资深 • 👑 OG — 验证有效期 90 天
                </Text>
            </View>
        </View>
    );
}
