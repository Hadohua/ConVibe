/**
 * components/MintBadgeButton.tsx - 铸造徽章按钮组件 V2
 * 
 * 显示铸造状态，调用 useMintSBT 铸造分层 SBT
 */

import { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Linking } from "react-native";
import { useMintSBT } from "../hooks/useMintSBT";
import { TIER, getTierInfo, type TierLevel } from "../lib/consensus/tier-calculator";

// ============================================
// 类型定义
// ============================================

interface MintBadgeButtonProps {
    /** 要铸造的流派列表 */
    genres: string[];
    /** 建议的等级 (来自 SpotifyVerifier) */
    suggestedTier?: TierLevel;
    /** 铸造成功回调 */
    onSuccess?: (txHash: string, mintedGenres: number[]) => void;
    /** 铸造失败回调 */
    onError?: (error: string) => void;
}

// ============================================
// 流派 ID 到名称映射
// ============================================

const GENRE_NAMES: Record<number, string> = {
    1: "Pop",
    2: "Rock",
    3: "Hip-Hop",
    4: "R&B",
    5: "Electronic",
    6: "Jazz",
    7: "Classical",
    8: "Country",
    9: "Indie",
    10: "Metal",
};

// ============================================
// MintBadgeButton 组件
// ============================================

export default function MintBadgeButton({
    genres,
    suggestedTier = TIER.ENTRY,
    onSuccess,
    onError,
}: MintBadgeButtonProps) {
    const {
        status,
        txHash,
        error,
        mintedGenres,
        faucetUrl,
        mint,
        reset,
    } = useMintSBT();

    const [disabled, setDisabled] = useState(false);

    const tierInfo = getTierInfo(suggestedTier);

    // 成功回调
    useEffect(() => {
        if (status === "success" && txHash && mintedGenres.length > 0) {
            onSuccess?.(txHash, mintedGenres);
        }
    }, [status, txHash, mintedGenres, onSuccess]);

    // 错误回调
    useEffect(() => {
        if (status === "error" && error) {
            onError?.(error);
        }
    }, [status, error, onError]);

    /**
     * 处理铸造 (V2: 传入 tier)
     */
    const handleMint = async () => {
        if (disabled || genres.length === 0) return;
        setDisabled(true);

        // 调用 mint，传入 tier
        await mint(genres, suggestedTier);

        setDisabled(false);
    };

    /**
     * 打开水龙头
     */
    const openFaucet = () => {
        Linking.openURL(faucetUrl);
    };

    // ============================================
    // 渲染
    // ============================================

    // 空闲状态
    if (status === "idle") {
        return (
            <View>
                {/* 显示即将铸造的等级 */}
                <View
                    className="rounded-xl p-3 mb-3 flex-row items-center justify-between"
                    style={{ backgroundColor: `${tierInfo.glowColor}` }}
                >
                    <View className="flex-row items-center">
                        <Text className="text-xl mr-2">{tierInfo.emoji}</Text>
                        <Text className="text-gray-300">
                            将铸造 <Text style={{ color: tierInfo.color }} className="font-bold">{tierInfo.name}</Text> 级徽章
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={handleMint}
                    disabled={disabled || genres.length === 0}
                    className="bg-primary-600 py-4 rounded-xl"
                    style={({ pressed }) => [
                        { opacity: pressed ? 0.8 : 1 },
                    ]}
                >
                    <View className="flex-row items-center justify-center">
                        <Text className="text-2xl mr-2">🏆</Text>
                        <Text className="text-white font-semibold text-lg">
                            铸造音乐徽章
                        </Text>
                    </View>
                </Pressable>
            </View>
        );
    }

    // 检查中
    if (status === "checking") {
        return (
            <View className="bg-dark-200 py-4 rounded-xl">
                <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#a855f7" />
                    <Text className="text-gray-400 ml-3">检查钱包余额...</Text>
                </View>
            </View>
        );
    }

    // Gas 不足
    if (status === "insufficient-gas") {
        return (
            <View className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-700/50">
                <Text className="text-yellow-400 font-semibold mb-2">⚠️ Gas 不足</Text>
                <Text className="text-gray-300 text-sm mb-3">
                    你的钱包需要一些测试 ETH 来支付交易费用。
                </Text>
                <Pressable
                    onPress={openFaucet}
                    className="bg-yellow-600 py-3 rounded-lg"
                >
                    <Text className="text-white text-center font-semibold">
                        获取免费测试 ETH →
                    </Text>
                </Pressable>
                <Pressable onPress={reset} className="mt-3">
                    <Text className="text-gray-400 text-center text-sm">重试</Text>
                </Pressable>
            </View>
        );
    }

    // 铸造中
    if (status === "minting") {
        return (
            <View className="bg-primary-900/30 py-6 rounded-xl border border-primary-700/50">
                <View className="items-center">
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text className="text-primary-400 mt-4 font-semibold">
                        正在铸造 {tierInfo.emoji} {tierInfo.name} 级徽章...
                    </Text>
                    <Text className="text-gray-400 text-sm mt-2">
                        请在钱包中确认交易
                    </Text>
                </View>
            </View>
        );
    }

    // 成功
    if (status === "success") {
        return (
            <View className="bg-green-900/30 rounded-xl p-4 border border-green-700/50">
                <Text className="text-green-400 text-lg font-semibold mb-2">
                    🎉 铸造成功！
                </Text>

                {mintedGenres.length > 0 && (
                    <View className="mb-3">
                        <Text className="text-gray-300 text-sm mb-2">
                            获得的 {tierInfo.emoji} {tierInfo.name} 级徽章：
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {mintedGenres.map((genreId) => (
                                <View
                                    key={genreId}
                                    className="bg-green-700/30 px-3 py-1 rounded-full"
                                >
                                    <Text className="text-green-300 text-sm">
                                        {GENRE_NAMES[genreId] || `#${genreId}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {txHash && (
                    <Pressable
                        onPress={() =>
                            Linking.openURL(
                                `https://sepolia.basescan.org/tx/${txHash}`
                            )
                        }
                    >
                        <Text className="text-primary-400 text-sm underline">
                            查看交易详情 →
                        </Text>
                    </Pressable>
                )}

                <Pressable
                    onPress={reset}
                    className="mt-4 py-2 rounded-lg bg-dark-50"
                >
                    <Text className="text-gray-400 text-center">完成</Text>
                </Pressable>
            </View>
        );
    }

    // 错误
    if (status === "error") {
        return (
            <View className="bg-red-900/30 rounded-xl p-4 border border-red-700/50">
                <Text className="text-red-400 font-semibold mb-2">❌ 铸造失败</Text>
                <Text className="text-gray-300 text-sm mb-3">{error}</Text>

                <Pressable
                    onPress={() => {
                        reset();
                        handleMint();
                    }}
                    className="bg-primary-600 py-3 rounded-lg"
                >
                    <Text className="text-white text-center font-semibold">重试</Text>
                </Pressable>
            </View>
        );
    }

    return null;
}
