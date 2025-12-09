/**
 * components/ProposalCard.tsx - 提案卡片组件
 * 
 * 显示音乐提案，带投票功能和动画效果
 * V2: 支持从父组件传入初始投票状态
 */

import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import { Image } from "expo-image";
import { useVote } from "../hooks/useVote";
import { Proposal, GENRE_INFO } from "../lib/types/proposal";

// ============================================
// 类型定义
// ============================================

interface ProposalCardProps {
    proposal: Proposal;
    onVote?: (proposalId: string, newVoteCount: number) => void;
    /** 是否已投票（从后端获取的持久化状态） */
    hasVoted?: boolean;
}

// ============================================
// ProposalCard 组件
// ============================================

export default function ProposalCard({ proposal, onVote, hasVoted: initialHasVoted = false }: ProposalCardProps) {
    const { vote, getVoteWeight } = useVote();

    const [voteCount, setVoteCount] = useState(proposal.voteCount);
    const [hasVoted, setHasVoted] = useState(initialHasVoted);
    const [voteWeight, setVoteWeight] = useState(1);
    const [hasSBT, setHasSBT] = useState(false);
    const [loading, setLoading] = useState(false);


    // 动画值
    const glowAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // 流派信息
    const genreInfo = GENRE_INFO[proposal.genreId] || {
        name: "Unknown",
        emoji: "🎵",
        color: "#a855f7"
    };

    // 计算进度条百分比 (最大 500 为 100%)
    const maxVotes = 500;
    const progressPercent = Math.min((voteCount / maxVotes) * 100, 100);

    // 加载权重信息
    useEffect(() => {
        const loadWeight = async () => {
            const { weight, hasSBT: has } = await getVoteWeight(proposal.genreId);
            setVoteWeight(weight);
            setHasSBT(has);
        };
        loadWeight();
    }, [proposal.genreId, getVoteWeight]);

    // 进度条动画
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progressPercent,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [progressPercent, progressAnim]);

    /**
     * 金光闪烁动画
     */
    const playGlowAnimation = () => {
        glowAnim.setValue(0);
        Animated.sequence([
            Animated.timing(glowAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    };

    /**
     * 按钮缩放动画
     */
    const playScaleAnimation = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    /**
     * 处理投票
     */
    const handleVote = async () => {
        if (hasVoted || loading) return;

        setLoading(true);

        const result = await vote(proposal.id, proposal.genreId);

        if (result.success) {
            // Optimistic Update
            const newCount = voteCount + result.weight;
            setVoteCount(newCount);
            setHasVoted(true);

            // 播放动画
            playScaleAnimation();
            if (result.hasSBT) {
                playGlowAnimation();
            }

            // 回调
            onVote?.(proposal.id, newCount);
        }

        setLoading(false);
    };

    // 金光样式
    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.8],
    });

    // 进度条宽度
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
    });

    return (
        <View className="bg-dark-200 rounded-2xl overflow-hidden mb-4">
            {/* 金光效果遮罩 */}
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "#FFD700",
                    opacity: glowOpacity,
                    zIndex: 10,
                }}
                pointerEvents="none"
            />

            <View className="flex-row p-4">
                {/* 封面图片 */}
                <View className="mr-4">
                    <Image
                        source={{ uri: proposal.coverUrl }}
                        style={{ width: 80, height: 80, borderRadius: 12 }}
                        contentFit="cover"
                        placeholder="L5H2EC=PM+yV0g-mq.wG9c%MtRt7"
                        transition={300}
                    />
                </View>

                {/* 内容区域 */}
                <View className="flex-1">
                    {/* 标题和流派 */}
                    <View className="flex-row items-center mb-1">
                        <View
                            className="px-2 py-0.5 rounded-full mr-2"
                            style={{ backgroundColor: `${genreInfo.color}30` }}
                        >
                            <Text style={{ color: genreInfo.color, fontSize: 12 }}>
                                {genreInfo.emoji} {genreInfo.name}
                            </Text>
                        </View>
                    </View>

                    {/* 歌曲名称 */}
                    <Text className="text-white font-semibold text-base" numberOfLines={1}>
                        {proposal.trackName}
                    </Text>

                    {/* 艺术家 */}
                    <Text className="text-gray-400 text-sm" numberOfLines={1}>
                        {proposal.artist}
                    </Text>

                    {/* 进度条 */}
                    <View className="mt-3">
                        <View className="h-2 bg-dark-50 rounded-full overflow-hidden">
                            <Animated.View
                                style={{
                                    height: "100%",
                                    width: progressWidth,
                                    backgroundColor: genreInfo.color,
                                    borderRadius: 999,
                                }}
                            />
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">
                            {voteCount} 共识分
                        </Text>
                    </View>
                </View>

                {/* 投票按钮 */}
                <View className="justify-center ml-3">
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Pressable
                            onPress={handleVote}
                            disabled={hasVoted || loading}
                            className={`px-4 py-3 rounded-xl ${hasVoted
                                ? "bg-gray-700"
                                : hasSBT
                                    ? "bg-yellow-500"
                                    : "bg-primary-600"
                                }`}
                            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        >
                            <Text className="text-white font-semibold text-center">
                                {hasVoted ? "✓" : loading ? "..." : "👍"}
                            </Text>
                            <Text
                                className={`text-xs text-center mt-1 ${hasSBT ? "text-yellow-900" : "text-white/70"
                                    }`}
                            >
                                {hasVoted ? "已投" : `x${voteWeight}`}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}
