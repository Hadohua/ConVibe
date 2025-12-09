/**
 * components/ConsensusFeed.tsx - 共识提案列表 V2
 * 
 * 显示音乐提案列表，支持下拉刷新
 * V2: 支持 Tab 切换（广场/深水区）和后端数据加载
 */

import { useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { useEmbeddedWallet } from "@privy-io/expo";
import ProposalCard from "./ProposalCard";
import GatedContentOverlay from "./GatedContentOverlay";
import { useGatedAccess } from "../hooks/useGatedAccess";
import { getProposals, subscribeToProposals } from "../lib/api/votes";
import { Proposal, MOCK_PROPOSALS, GENRE_INFO, Genre } from "../lib/types/proposal";
import type { Channel, ProposalWithVotes, DbProposal } from "../lib/supabase/types";

// ============================================
// 频道配置
// ============================================

const CHANNELS = [
    { key: "public" as Channel, label: "🌐 广场", color: "#8b5cf6" },
    { key: "gated" as Channel, label: "🔒 深水区", color: "#fbbf24" },
];

// 深水区默认需要的流派和等级（Hip-Hop Tier 2）
const DEFAULT_GATED_REQUIRE = {
    genreId: Genre.HIPHOP,
    tier: 2,
};

// ============================================
// ConsensusFeed 组件
// ============================================

export default function ConsensusFeed() {
    const wallet = useEmbeddedWallet();
    const { checkAccess } = useGatedAccess();

    // 频道和提案状态
    const [channel, setChannel] = useState<Channel>("public");
    const [proposals, setProposals] = useState<ProposalWithVotes[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // 深水区权限状态
    const [hasGatedAccess, setHasGatedAccess] = useState(false);
    const [userTier, setUserTier] = useState(0);
    const [checkingAccess, setCheckingAccess] = useState(false);

    /**
     * 加载提案数据
     */
    const loadProposals = useCallback(async (targetChannel: Channel) => {
        try {
            const userAddress = wallet.account?.address;
            const data = await getProposals(targetChannel, userAddress);
            setProposals(data);
        } catch (err) {
            console.error("加载提案失败:", err);
            // 使用 mock 数据作为备用
            setProposals(MOCK_PROPOSALS.map(p => ({
                id: p.id,
                track_name: p.trackName,
                artist: p.artist,
                genre_id: p.genreId,
                cover_url: p.coverUrl,
                vote_count: p.voteCount,
                is_gated: false,
                required_tier: 0,
                proposer_address: p.proposer || null,
                created_at: p.createdAt.toISOString(),
                hasVoted: false,
            })));
        } finally {
            setLoading(false);
        }
    }, [wallet.account?.address]);

    /**
     * 检查深水区权限
     */
    const checkGatedPermission = useCallback(async () => {
        if (!wallet.account?.address) {
            setHasGatedAccess(false);
            setUserTier(0);
            return;
        }

        setCheckingAccess(true);
        try {
            const result = await checkAccess(
                DEFAULT_GATED_REQUIRE.genreId,
                DEFAULT_GATED_REQUIRE.tier
            );
            setHasGatedAccess(result.hasAccess);
            setUserTier(result.userTier);
        } catch (err) {
            console.error("权限检查失败:", err);
            setHasGatedAccess(false);
        } finally {
            setCheckingAccess(false);
        }
    }, [wallet.account?.address, checkAccess]);

    /**
     * 切换频道
     */
    const handleChannelChange = async (newChannel: Channel) => {
        setChannel(newChannel);
        setLoading(true);

        if (newChannel === "gated") {
            await checkGatedPermission();
        }

        await loadProposals(newChannel);
    };

    /**
     * 下拉刷新
     */
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProposals(channel);
        if (channel === "gated") {
            await checkGatedPermission();
        }
        setRefreshing(false);
    }, [channel, loadProposals, checkGatedPermission]);

    /**
     * 处理投票更新
     */
    const handleVote = (proposalId: string, newVoteCount: number) => {
        setProposals((prev) =>
            prev.map((p) =>
                p.id === proposalId
                    ? { ...p, vote_count: newVoteCount, hasVoted: true }
                    : p
            )
        );
    };

    /**
     * 初始加载
     */
    useEffect(() => {
        loadProposals(channel);
    }, []);

    /**
     * 订阅实时更新
     */
    useEffect(() => {
        const subscription = subscribeToProposals((updated: DbProposal) => {
            setProposals((prev) =>
                prev.map((p) =>
                    p.id === updated.id
                        ? { ...p, vote_count: updated.vote_count }
                        : p
                )
            );
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * 转换为 ProposalCard 需要的格式
     */
    const toProposalFormat = (p: ProposalWithVotes): Proposal => ({
        id: p.id,
        trackName: p.track_name,
        artist: p.artist,
        genreId: p.genre_id,
        coverUrl: p.cover_url || "",
        voteCount: p.vote_count,
        createdAt: new Date(p.created_at),
        proposer: p.proposer_address || undefined,
    });

    /**
     * 渲染提案卡片
     */
    const renderItem = ({ item }: { item: ProposalWithVotes }) => (
        <ProposalCard
            proposal={toProposalFormat(item)}
            onVote={handleVote}
            hasVoted={item.hasVoted}
        />
    );

    /**
     * 列表头部 - Tab 切换
     */
    const ListHeader = () => (
        <View className="mb-4">
            {/* Tab 切换 */}
            <View className="flex-row bg-dark-200 rounded-xl p-1 mb-4">
                {CHANNELS.map((ch) => (
                    <Pressable
                        key={ch.key}
                        onPress={() => handleChannelChange(ch.key)}
                        className={`flex-1 py-3 rounded-lg items-center ${channel === ch.key ? "bg-dark-50" : ""
                            }`}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    >
                        <Text
                            className={`font-semibold ${channel === ch.key ? "text-white" : "text-gray-500"
                                }`}
                            style={channel === ch.key ? { color: ch.color } : undefined}
                        >
                            {ch.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* 频道标题和信息 */}
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-white text-xl font-bold">
                        {channel === "public" ? "🔥 共识热榜" : "🎧 深水讨论"}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                        {channel === "public"
                            ? "投票支持你喜欢的音乐"
                            : "资深乐迷的专属空间"}
                    </Text>
                </View>
                <View className="bg-primary-900/50 px-3 py-1 rounded-full">
                    <Text className="text-primary-400 text-sm">
                        {proposals.length} 个提案
                    </Text>
                </View>
            </View>

            {/* 权重说明 (仅公开区显示) */}
            {channel === "public" && (
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
            )}
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

    /**
     * 加载状态
     */
    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-gray-400 mt-4">加载中...</Text>
            </View>
        );
    }

    /**
     * 深水区无权限时显示遮罩
     */
    if (channel === "gated" && !hasGatedAccess && !checkingAccess) {
        return (
            <View className="flex-1">
                <ListHeader />
                <View className="flex-1 relative">
                    {/* 模糊的提案列表预览 */}
                    <FlatList
                        data={proposals.slice(0, 3)}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        style={{ opacity: 0.3 }}
                    />
                    {/* 遮罩 */}
                    <GatedContentOverlay
                        requiredGenreId={DEFAULT_GATED_REQUIRE.genreId}
                        requiredTier={DEFAULT_GATED_REQUIRE.tier}
                        userTier={userTier}
                    />
                </View>
            </View>
        );
    }

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
