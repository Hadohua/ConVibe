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
            streaming_records: {
                Row: DbStreamingRecord;
                Insert: Omit<DbStreamingRecord, "id" | "created_at">;
                Update: Partial<DbStreamingRecord>;
            };
            user_spotify_tokens: {
                Row: DbUserSpotifyTokens;
                Insert: Omit<DbUserSpotifyTokens, "created_at" | "updated_at">;
                Update: Partial<DbUserSpotifyTokens>;
            };
        };
    };
}

// ============================================
// 流媒体同步相关表
// ============================================

/**
 * streaming_records 表 - 流媒体播放记录
 */
export interface DbStreamingRecord {
    id: string;
    user_id: string;
    ts: string; // ISO timestamp
    ms_played: number;
    track_name: string | null;
    artist_name: string | null;
    album_name: string | null;
    spotify_track_uri: string | null;
    source: 'json_import' | 'api_sync';
    created_at: string;
}

/**
 * user_spotify_tokens 表 - Spotify Token 存储
 */
export interface DbUserSpotifyTokens {
    user_id: string;
    access_token: string;
    refresh_token: string | null;
    expires_at: string;
    last_sync_at: string | null;
    created_at: string;
    updated_at: string;
}

