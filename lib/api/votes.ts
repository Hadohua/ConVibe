/**
 * lib/api/votes.ts - 投票 API
 * 
 * 封装与 Supabase 的投票交互逻辑
 * V2: 在 Mock 模式下使用内存缓存保持投票状态
 */

import { getSupabase, isSupabaseConfigured } from "../supabase/client";
import type { DbProposal, Channel, VoteResponse, ProposalWithVotes } from "../supabase/types";
import { MOCK_PROPOSALS } from "../types/proposal";

// ============================================
// Mock 模式内存缓存
// ============================================

// 缓存投票状态（proposal_id -> voter_addresses）
const mockVotesCache: Map<string, Set<string>> = new Map();

// 缓存累计票数变化（proposal_id -> added_votes）
const mockVoteCountsCache: Map<string, number> = new Map();

/**
 * 获取 Mock 提案的当前票数（原始 + 增量）
 */
function getMockVoteCount(proposalId: string, originalCount: number): number {
    const addedVotes = mockVoteCountsCache.get(proposalId) || 0;
    return originalCount + addedVotes;
}

/**
 * 检查 Mock 模式下是否已投票
 */
function hasMockVoted(proposalId: string, voterAddress: string): boolean {
    const voters = mockVotesCache.get(proposalId);
    return voters?.has(voterAddress.toLowerCase()) || false;
}

/**
 * 记录 Mock 投票
 */
function recordMockVote(proposalId: string, voterAddress: string, weight: number): number {
    const normalizedAddress = voterAddress.toLowerCase();

    // 记录投票者
    if (!mockVotesCache.has(proposalId)) {
        mockVotesCache.set(proposalId, new Set());
    }
    mockVotesCache.get(proposalId)!.add(normalizedAddress);

    // 累加票数
    const currentAdded = mockVoteCountsCache.get(proposalId) || 0;
    const newAdded = currentAdded + weight;
    mockVoteCountsCache.set(proposalId, newAdded);

    // 返回当前总票数
    const mockProposal = MOCK_PROPOSALS.find(p => p.id === proposalId);
    return (mockProposal?.voteCount || 0) + newAdded;
}

// ============================================
// 提案 API
// ============================================

/**
 * 获取提案列表
 * @param channel - 频道类型 (public/gated)
 * @param userAddress - 用户地址（用于检查是否已投票）
 */
export async function getProposals(
    channel: Channel = "public",
    userAddress?: string
): Promise<ProposalWithVotes[]> {
    // 如果 Supabase 未配置，返回带缓存状态的 mock 数据
    if (!isSupabaseConfigured()) {
        console.log("使用 Mock 数据（带内存缓存）");

        // 根据频道筛选 mock 数据
        const filteredMock = channel === "gated"
            ? MOCK_PROPOSALS.slice(0, 2).map(p => ({ ...p, is_gated: true, required_tier: 2 }))
            : MOCK_PROPOSALS;

        return filteredMock.map(p => ({
            id: p.id,
            track_name: p.trackName,
            artist: p.artist,
            genre_id: p.genreId,
            cover_url: p.coverUrl,
            // 使用缓存的票数
            vote_count: getMockVoteCount(p.id, p.voteCount),
            is_gated: channel === "gated",
            required_tier: channel === "gated" ? 2 : 0,
            proposer_address: p.proposer || null,
            created_at: p.createdAt.toISOString(),
            // 使用缓存的投票状态
            hasVoted: userAddress ? hasMockVoted(p.id, userAddress) : false,
        }));
    }

    const supabase = getSupabase();
    if (!supabase) {
        return [];
    }

    try {
        // 查询提案
        let query = supabase
            .from("proposals")
            .select("*")
            .order("vote_count", { ascending: false });

        // 根据频道筛选
        if (channel === "public") {
            query = query.eq("is_gated", false);
        } else {
            query = query.eq("is_gated", true);
        }

        const { data: proposals, error } = await query;

        if (error) {
            console.error("获取提案失败:", error);
            return [];
        }

        // 如果有用户地址，检查投票状态
        let votedProposalIds: Set<string> = new Set();
        if (userAddress) {
            const { data: votes } = await supabase
                .from("votes")
                .select("proposal_id")
                .eq("voter_address", userAddress.toLowerCase());

            if (votes) {
                votedProposalIds = new Set(votes.map((v: any) => v.proposal_id));
            }
        }

        return (proposals || []).map((p: any) => ({
            ...p,
            hasVoted: votedProposalIds.has(p.id),
        }));
    } catch (err) {
        console.error("获取提案异常:", err);
        return [];
    }
}

/**
 * 获取单个提案
 */
export async function getProposal(proposalId: string): Promise<DbProposal | null> {
    if (!isSupabaseConfigured()) {
        const mock = MOCK_PROPOSALS.find(p => p.id === proposalId);
        if (!mock) return null;
        return {
            id: mock.id,
            track_name: mock.trackName,
            artist: mock.artist,
            genre_id: mock.genreId,
            cover_url: mock.coverUrl,
            vote_count: getMockVoteCount(mock.id, mock.voteCount),
            is_gated: false,
            required_tier: 0,
            proposer_address: mock.proposer || null,
            created_at: mock.createdAt.toISOString(),
        };
    }

    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", proposalId)
        .single();

    if (error) {
        console.error("获取提案失败:", error);
        return null;
    }

    return data;
}

// ============================================
// 投票 API
// ============================================

/**
 * 检查用户是否已投过票
 */
export async function hasVoted(
    proposalId: string,
    voterAddress: string
): Promise<boolean> {
    if (!isSupabaseConfigured()) {
        // 使用内存缓存检查
        return hasMockVoted(proposalId, voterAddress);
    }

    const supabase = getSupabase();
    if (!supabase) return false;

    const { data, error } = await supabase
        .from("votes")
        .select("id")
        .eq("proposal_id", proposalId)
        .eq("voter_address", voterAddress.toLowerCase())
        .maybeSingle();

    if (error) {
        console.error("检查投票状态失败:", error);
        return false;
    }

    return data !== null;
}

/**
 * 提交投票
 * @param proposalId - 提案 ID
 * @param voterAddress - 投票者地址
 * @param weight - 投票权重
 * @param genreMatch - 是否流派匹配
 */
export async function submitVote(
    proposalId: string,
    voterAddress: string,
    weight: number,
    genreMatch: boolean = false
): Promise<VoteResponse> {
    if (!isSupabaseConfigured()) {
        // Mock 模式：检查是否已投票
        if (hasMockVoted(proposalId, voterAddress)) {
            return { success: false, error: "已投过票" };
        }

        // 记录投票并返回新票数
        const newCount = recordMockVote(proposalId, voterAddress, weight);
        console.log(`[Mock] 投票成功: proposal=${proposalId}, weight=${weight}, newCount=${newCount}`);
        return { success: true, newVoteCount: newCount };
    }

    const supabase = getSupabase();
    if (!supabase) {
        return { success: false, error: "Supabase 未配置" };
    }

    try {
        const normalizedAddress = voterAddress.toLowerCase();

        // 检查是否已投票
        const voted = await hasVoted(proposalId, normalizedAddress);
        if (voted) {
            return { success: false, error: "已投过票" };
        }

        // 插入投票记录
        const { error: voteError } = await supabase
            .from("votes")
            .insert({
                proposal_id: proposalId,
                voter_address: normalizedAddress,
                weight: weight,
                genre_match: genreMatch,
            });

        if (voteError) {
            console.error("插入投票失败:", voteError);
            return { success: false, error: voteError.message };
        }

        // 更新提案总票数
        const { data: proposal, error: fetchError } = await supabase
            .from("proposals")
            .select("vote_count")
            .eq("id", proposalId)
            .single();

        if (fetchError || !proposal) {
            return { success: false, error: "提案不存在" };
        }

        const newCount = ((proposal as any).vote_count || 0) + weight;

        const { error: updateError } = await supabase
            .from("proposals")
            .update({ vote_count: newCount })
            .eq("id", proposalId);

        if (updateError) {
            console.error("更新票数失败:", updateError);
            return { success: false, error: updateError.message };
        }

        return { success: true, newVoteCount: newCount };
    } catch (err) {
        console.error("投票异常:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "未知错误",
        };
    }
}

/**
 * 获取提案的投票详情
 */
export async function getVoteDetails(proposalId: string): Promise<{
    total: number;
    breakdown: { genreMatch: number; other: number };
}> {
    if (!isSupabaseConfigured()) {
        const addedVotes = mockVoteCountsCache.get(proposalId) || 0;
        return { total: addedVotes, breakdown: { genreMatch: 0, other: addedVotes } };
    }

    const supabase = getSupabase();
    if (!supabase) {
        return { total: 0, breakdown: { genreMatch: 0, other: 0 } };
    }

    const { data: votes, error } = await supabase
        .from("votes")
        .select("weight, genre_match")
        .eq("proposal_id", proposalId);

    if (error || !votes) {
        return { total: 0, breakdown: { genreMatch: 0, other: 0 } };
    }

    const genreMatch = votes
        .filter((v: any) => v.genre_match)
        .reduce((sum: number, v: any) => sum + v.weight, 0);

    const other = votes
        .filter((v: any) => !v.genre_match)
        .reduce((sum: number, v: any) => sum + v.weight, 0);

    return {
        total: genreMatch + other,
        breakdown: { genreMatch, other },
    };
}

// ============================================
// 实时订阅
// ============================================

/**
 * 订阅提案更新
 */
export function subscribeToProposals(
    callback: (proposal: DbProposal) => void
) {
    if (!isSupabaseConfigured()) {
        console.log("Supabase 未配置，跳过实时订阅");
        return { unsubscribe: () => { } };
    }

    const supabase = getSupabase();
    if (!supabase) {
        return { unsubscribe: () => { } };
    }

    const subscription = supabase
        .channel("proposals_updates")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "proposals",
            },
            (payload) => {
                callback(payload.new as DbProposal);
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            subscription.unsubscribe();
        },
    };
}
