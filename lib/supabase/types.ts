/**
 * lib/supabase/types.ts - Supabase 表结构类型定义
 * 
 * 定义投票系统的数据库模型
 */

// ============================================
// 数据库表类型
// ============================================

/**
 * proposals 表 - 音乐提案
 */
export interface DbProposal {
    id: string;
    track_name: string;
    artist: string;
    genre_id: number;
    cover_url: string | null;
    vote_count: number;
    is_gated: boolean;
    required_tier: number;
    proposer_address: string | null;
    created_at: string;
}

/**
 * votes 表 - 投票记录
 */
export interface DbVote {
    id: string;
    proposal_id: string;
    voter_address: string;
    weight: number;
    genre_match: boolean;
    created_at: string;
}

// ============================================
// API 响应类型
// ============================================

export interface VoteResponse {
    success: boolean;
    newVoteCount?: number;
    error?: string;
}

export interface ProposalWithVotes extends DbProposal {
    hasVoted?: boolean;
    userWeight?: number;
}

// ============================================
// 频道类型
// ============================================

export type Channel = "public" | "gated";

// ============================================
// 数据库 Schema (用于 Supabase 类型推断)
// ============================================

export interface Database {
    public: {
        Tables: {
            proposals: {
                Row: DbProposal;
                Insert: Omit<DbProposal, "id" | "created_at" | "vote_count">;
                Update: Partial<DbProposal>;
            };
            votes: {
                Row: DbVote;
                Insert: Omit<DbVote, "id" | "created_at">;
                Update: Partial<DbVote>;
            };
        };
    };
}
