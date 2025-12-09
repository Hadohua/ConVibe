/**
 * components/GatedContentOverlay.tsx - 深水区模糊遮罩组件
 * 
 * 当用户没有足够权限查看深水区内容时显示的遮罩
 */

import { View, Text, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { GENRE_INFO } from "../lib/types/proposal";

// ============================================
// 类型定义
// ============================================

interface GatedContentOverlayProps {
    /** 需要的流派 ID */
    requiredGenreId: number;
    /** 需要的最低等级 */
    requiredTier: number;
    /** 用户当前等级（如果有） */
    userTier?: number;
    /** 是否全屏模式 */
    fullScreen?: boolean;
}

// ============================================
// 等级名称
// ============================================

const TIER_NAMES: Record<number, string> = {
    1: "入门",
    2: "进阶",
    3: "专家",
};

// ============================================
// GatedContentOverlay 组件
// ============================================

export default function GatedContentOverlay({
    requiredGenreId,
    requiredTier,
    userTier = 0,
    fullScreen = false,
}: GatedContentOverlayProps) {
    const router = useRouter();

    const genreInfo = GENRE_INFO[requiredGenreId] || {
        name: "Unknown",
        emoji: "🎵",
        color: "#a855f7",
    };

    const tierName = TIER_NAMES[requiredTier] || `Tier ${requiredTier}`;

    /**
     * 跳转到验证页面
     */
    const handleGoToVerify = () => {
        router.push("/verify-spotify");
    };

    return (
        <View
            className={`${fullScreen ? "flex-1" : "absolute inset-0"} overflow-hidden`}
            style={{ borderRadius: fullScreen ? 0 : 16 }}
        >
            {/* 模糊背景 */}
            <BlurView
                intensity={40}
                tint="dark"
                className="absolute inset-0"
            />

            {/* 遮罩内容 */}
            <View className="absolute inset-0 items-center justify-center p-6">
                {/* 锁定图标 */}
                <View
                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: `${genreInfo.color}30` }}
                >
                    <Text className="text-4xl">🔒</Text>
                </View>

                {/* 提示文字 */}
                <Text className="text-white text-xl font-bold text-center mb-2">
                    你的 {genreInfo.name} 浓度不足
                </Text>

                <Text className="text-gray-400 text-center mb-6">
                    需要 {genreInfo.emoji} {tierName}+ 徽章才能解锁此内容
                </Text>

                {/* 当前状态 */}
                {userTier > 0 ? (
                    <View className="bg-dark-200 rounded-xl px-4 py-2 mb-4">
                        <Text className="text-gray-400 text-sm text-center">
                            你当前等级：{TIER_NAMES[userTier] || `Tier ${userTier}`}
                            {" "}→{" "}
                            需要：{tierName}
                        </Text>
                    </View>
                ) : (
                    <View className="bg-dark-200 rounded-xl px-4 py-2 mb-4">
                        <Text className="text-gray-400 text-sm text-center">
                            你还没有 {genreInfo.name} 徽章
                        </Text>
                    </View>
                )}

                {/* 前往获取按钮 */}
                <Pressable
                    onPress={handleGoToVerify}
                    className="bg-primary-600 px-6 py-3 rounded-xl"
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                    <Text className="text-white font-semibold">🎵 前往获取徽章</Text>
                </Pressable>

                {/* 装饰信息 */}
                <Text className="text-gray-500 text-xs mt-6 text-center">
                    深水区是资深乐迷的专属空间{"\n"}
                    这里有更深度的乐评和更高质量的讨论
                </Text>
            </View>
        </View>
    );
}
