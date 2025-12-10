/**
 * components/stats/TierProgressCard.tsx - SBT 等级进度卡片
 * 
 * 显示用户在某流派的听歌进度与 SBT 等级的关系
 */

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { getTierInfo, type TierLevel } from "../../lib/consensus/tier-calculator";
import { GENRE_INFO } from "../../lib/types/proposal";

// ============================================
// 类型定义
// ============================================

interface TierProgressCardProps {
    /** 流派 ID */
    genreId: number;
    /** 当前播放小时数 */
    currentHours: number;
    /** 当前等级 */
    currentTier: TierLevel;
    /** 是否已铸造 */
    hasMinted?: boolean;
}

// ============================================
// 等级阈值
// ============================================

const TIER_THRESHOLDS = [
    { tier: 1, hours: 0, label: "入门" },
    { tier: 2, hours: 3, label: "进阶" },
    { tier: 3, hours: 10, label: "OG" },
];

const MAX_HOURS = 15; // 进度条最大值

// ============================================
// TierProgressCard 组件
// ============================================

export default function TierProgressCard({
    genreId,
    currentHours,
    currentTier,
    hasMinted = false,
}: TierProgressCardProps) {
    const router = useRouter();
    const genreInfo = GENRE_INFO[genreId] || { name: "Unknown", emoji: "🎵", color: "#8b5cf6" };
    const tierInfo = getTierInfo(currentTier);

    // 计算进度条百分比
    const progressPercent = Math.min((currentHours / MAX_HOURS) * 100, 100);

    // 计算离下一等级还差多少
    const nextTier = TIER_THRESHOLDS.find(t => t.tier > currentTier);
    const hoursToNext = nextTier ? Math.max(0, nextTier.hours - currentHours) : 0;

    /**
     * 跳转到铸造页面
     */
    const handleMint = () => {
        router.push("/verify-spotify");
    };

    return (
        <View
            className="rounded-2xl p-4 overflow-hidden"
            style={{ backgroundColor: `${genreInfo.color}15` }}
        >
            {/* 标题 */}
            <View className="flex-row items-center mb-4">
                <Text className="text-2xl mr-2">{genreInfo.emoji}</Text>
                <View>
                    <Text className="text-white font-bold text-lg">
                        你的 {genreInfo.name} 浓度
                    </Text>
                    <Text className="text-gray-400 text-sm">
                        已听 {currentHours.toFixed(1)} 小时
                    </Text>
                </View>
            </View>

            {/* 进度条 */}
            <View className="mb-4">
                <View className="h-3 bg-dark-50 rounded-full overflow-hidden">
                    <View
                        className="h-full rounded-full"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: genreInfo.color,
                        }}
                    />
                </View>

                {/* 等级标记 */}
                <View className="flex-row mt-2">
                    {TIER_THRESHOLDS.map((t) => {
                        const isActive = currentTier >= t.tier;
                        const isCurrentLevel = currentTier === t.tier;
                        const position = (t.hours / MAX_HOURS) * 100;

                        return (
                            <View
                                key={t.tier}
                                className="items-center"
                                style={{
                                    position: "absolute",
                                    left: `${Math.min(position, 95)}%`,
                                    transform: [{ translateX: -20 }],
                                }}
                            >
                                <View
                                    className={`w-4 h-4 rounded-full border-2 ${isActive ? "bg-white" : "bg-dark-200"
                                        }`}
                                    style={{
                                        borderColor: isActive ? genreInfo.color : "#52525b",
                                    }}
                                />
                                <Text
                                    className={`text-xs mt-1 ${isCurrentLevel ? "text-white font-bold" : "text-gray-500"
                                        }`}
                                >
                                    {t.label}
                                </Text>
                                <Text className="text-gray-600 text-xs">
                                    {t.hours}h
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* 当前状态提示 */}
            <View className="mt-8 pt-4 border-t border-white/10">
                {nextTier ? (
                    <Text className="text-gray-400 text-center mb-3">
                        再听 <Text className="text-white font-bold">{hoursToNext.toFixed(1)} 小时</Text> 即可升级到{" "}
                        <Text style={{ color: getTierInfo(nextTier.tier as TierLevel).color }}>
                            {nextTier.label}
                        </Text>
                    </Text>
                ) : (
                    <Text className="text-gray-400 text-center mb-3">
                        🎉 你已达到最高等级！
                    </Text>
                )}

                {/* 铸造按钮 */}
                {!hasMinted && (
                    <Pressable
                        onPress={handleMint}
                        className="py-3 rounded-xl items-center"
                        style={{ backgroundColor: genreInfo.color }}
                    >
                        <Text className="text-white font-bold">
                            {tierInfo.emoji} 铸造 {tierInfo.name} 徽章
                        </Text>
                    </Pressable>
                )}

                {hasMinted && (
                    <View className="py-3 rounded-xl items-center bg-dark-200">
                        <Text className="text-green-500 font-medium">
                            ✓ 已铸造 {tierInfo.name} 徽章
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
