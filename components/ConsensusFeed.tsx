/**
 * components/ConsensusFeed.tsx - 共识提案列表
 * 
 * 显示音乐提案列表，支持下拉刷新
 */

import { useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, Pressable } from "react-native";
import ProposalCard from "./ProposalCard";
import { Proposal, MOCK_PROPOSALS } from "../lib/types/proposal";

// ============================================
// ConsensusFeed 组件
// ============================================

export default function ConsensusFeed() {
    const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);
    const [refreshing, setRefreshing] = useState(false);

    /**
     * 下拉刷新
     */
    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        // 模拟网络请求
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 重置数据（真实应用会从服务器获取）
        setProposals(MOCK_PROPOSALS);

        setRefreshing(false);
    }, []);

    /**
     * 处理投票更新
     */
    const handleVote = (proposalId: string, newVoteCount: number) => {
        setProposals((prev) =>
            prev.map((p) =>
                p.id === proposalId ? { ...p, voteCount: newVoteCount } : p
            )
        );
    };

    /**
     * 渲染提案卡片
     */
    const renderItem = ({ item }: { item: Proposal }) => (
        <ProposalCard proposal={item} onVote={handleVote} />
    );

    /**
     * 列表头部
     */
    const ListHeader = () => (
        <View className="mb-4">
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-white text-xl font-bold">🔥 共识热榜</Text>
                    <Text className="text-gray-400 text-sm mt-1">
                        投票支持你喜欢的音乐
                    </Text>
                </View>
                <View className="bg-primary-900/50 px-3 py-1 rounded-full">
                    <Text className="text-primary-400 text-sm">
                        {proposals.length} 个提案
                    </Text>
                </View>
            </View>

            {/* 权重说明 */}
            <View className="bg-dark-200 rounded-xl p-4 mt-4">
                <Text className="text-white font-semibold mb-2">💡 投票权重</Text>
                <View className="flex-row flex-wrap gap-3">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-gray-500 mr-2" />
                        <Text className="text-gray-400 text-sm">普通用户 x1</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-primary-500 mr-2" />
                        <Text className="text-gray-400 text-sm">SBT 持有者 x6</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                        <Text className="text-gray-400 text-sm">流派匹配 x11</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    /**
     * 空状态
     */
    const ListEmpty = () => (
        <View className="items-center py-8">
            <Text className="text-4xl mb-4">🎵</Text>
            <Text className="text-gray-400">暂无提案</Text>
            <Pressable className="mt-4 bg-primary-600 px-6 py-3 rounded-xl">
                <Text className="text-white font-semibold">创建第一个提案</Text>
            </Pressable>
        </View>
    );

    return (
        <FlatList
            data={proposals}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={ListEmpty}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#a855f7"
                />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
    );
}
