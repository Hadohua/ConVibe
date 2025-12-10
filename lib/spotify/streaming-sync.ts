/**
 * lib/spotify/streaming-sync.ts - 流媒体数据同步服务
 * 
 * 实现 Stats.fm 风格的混合数据同步:
 * - JSON 导入: 历史数据一次性导入
 * - API 同步: 实时增量更新
 */

import { getSupabase, isSupabaseConfigured } from '../supabase/client';
import type { StreamingRecord } from './streaming-history-parser';
import { getRecentlyPlayed, convertRecentlyPlayedToRecord } from './spotify-api';
import type { SpotifyTokens } from './spotify-auth';
import { SPOTIFY_TOKEN_ENDPOINT, getSpotifyClientId } from './spotify-auth';

// ============================================
// 类型定义
// ============================================

/** 数据来源 */
export type RecordSource = 'json_import' | 'api_sync';

/** 同步结果 */
export interface SyncResult {
    success: boolean;
    recordsAdded: number;
    recordsSkipped: number; // 重复记录
    lastPlayedAt: string | null;
    error?: string;
}

/** 用户 Token 记录 */
export interface UserSpotifyTokens {
    user_id: string;
    access_token: string;
    refresh_token: string | null;
    expires_at: string;
    last_sync_at: string | null;
}

// ============================================
// Token 管理
// ============================================

/**
 * 保存 Spotify Token 到 Supabase
 */
export async function saveSpotifyTokens(
    userId: string,
    tokens: SpotifyTokens
): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('Supabase not configured, tokens not saved to cloud');
        return;
    }

    const { error } = await supabase
        .from('user_spotify_tokens')
        .upsert({
            user_id: userId,
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken || null,
            expires_at: new Date(tokens.expiresAt).toISOString(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id',
        });

    if (error) {
        console.error('Failed to save Spotify tokens:', error);
        throw error;
    }
}

/**
 * 加载用户的 Spotify Token
 */
export async function loadSpotifyTokens(
    userId: string
): Promise<UserSpotifyTokens | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('user_spotify_tokens')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) return null;
    return data as UserSpotifyTokens;
}

/**
 * 刷新 Access Token
 */
export async function refreshAccessToken(
    refreshToken: string
): Promise<SpotifyTokens | null> {
    try {
        const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: getSpotifyClientId(),
            }),
        });

        if (!response.ok) {
            console.error('Token refresh failed:', response.status);
            return null;
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            expiresAt: Date.now() + data.expires_in * 1000,
        };
    } catch (error) {
        console.error('Token refresh error:', error);
        return null;
    }
}

// ============================================
// 数据同步
// ============================================

/**
 * 同步最近播放记录
 * 
 * @param userId - 用户 ID (钱包地址或 Supabase auth ID)
 * @param accessToken - Spotify Access Token
 * @param afterTimestamp - 可选，只获取此时间之后的记录
 */
export async function syncRecentPlays(
    userId: string,
    accessToken: string,
    afterTimestamp?: number
): Promise<SyncResult> {
    const supabase = getSupabase();
    if (!supabase) {
        return {
            success: false,
            recordsAdded: 0,
            recordsSkipped: 0,
            lastPlayedAt: null,
            error: 'Supabase not configured',
        };
    }

    try {
        // 获取最近播放
        const recentlyPlayed = await getRecentlyPlayed(
            accessToken,
            50,
            afterTimestamp
        );

        if (recentlyPlayed.items.length === 0) {
            return {
                success: true,
                recordsAdded: 0,
                recordsSkipped: 0,
                lastPlayedAt: null,
            };
        }

        // 转换格式并准备插入
        const records = recentlyPlayed.items.map(item => {
            const record = convertRecentlyPlayedToRecord(item);
            return {
                user_id: userId,
                ts: record.ts,
                ms_played: record.ms_played,
                track_name: record.track_name,
                artist_name: record.artist_name,
                album_name: record.album_name,
                spotify_track_uri: record.spotify_track_uri,
                source: 'api_sync' as RecordSource,
            };
        });

        // 批量插入，忽略重复
        const { data, error } = await supabase
            .from('streaming_records')
            .upsert(records, {
                onConflict: 'user_id,ts,spotify_track_uri',
                ignoreDuplicates: true,
            })
            .select();

        if (error) {
            console.error('Failed to insert records:', error);
            return {
                success: false,
                recordsAdded: 0,
                recordsSkipped: records.length,
                lastPlayedAt: null,
                error: error.message,
            };
        }

        const recordsAdded = data?.length || 0;

        // 更新最后同步时间
        await supabase
            .from('user_spotify_tokens')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('user_id', userId);

        return {
            success: true,
            recordsAdded,
            recordsSkipped: records.length - recordsAdded,
            lastPlayedAt: recentlyPlayed.items[0]?.played_at || null,
        };
    } catch (error) {
        console.error('Sync error:', error);
        return {
            success: false,
            recordsAdded: 0,
            recordsSkipped: 0,
            lastPlayedAt: null,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * 批量导入 JSON 记录到数据库
 * 
 * @param userId - 用户 ID
 * @param records - 解析后的流媒体记录
 */
export async function importJsonRecords(
    userId: string,
    records: StreamingRecord[]
): Promise<SyncResult> {
    const supabase = getSupabase();
    if (!supabase) {
        return {
            success: false,
            recordsAdded: 0,
            recordsSkipped: 0,
            lastPlayedAt: null,
            error: 'Supabase not configured',
        };
    }

    try {
        // 过滤有效记录并转换格式
        const validRecords = records
            .filter(r => r.master_metadata_track_name && r.ms_played >= 30000)
            .map(r => ({
                user_id: userId,
                ts: r.ts,
                ms_played: r.ms_played,
                track_name: r.master_metadata_track_name,
                artist_name: r.master_metadata_album_artist_name,
                album_name: r.master_metadata_album_album_name,
                spotify_track_uri: r.spotify_track_uri,
                source: 'json_import' as RecordSource,
            }));

        // 分批插入（每批 1000 条）
        const BATCH_SIZE = 1000;
        let totalAdded = 0;
        let totalSkipped = 0;

        for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
            const batch = validRecords.slice(i, i + BATCH_SIZE);

            const { data, error } = await supabase
                .from('streaming_records')
                .upsert(batch, {
                    onConflict: 'user_id,ts,spotify_track_uri',
                    ignoreDuplicates: true,
                })
                .select();

            if (error) {
                console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error);
                totalSkipped += batch.length;
            } else {
                totalAdded += data?.length || 0;
                totalSkipped += batch.length - (data?.length || 0);
            }
        }

        return {
            success: true,
            recordsAdded: totalAdded,
            recordsSkipped: totalSkipped,
            lastPlayedAt: validRecords[0]?.ts || null,
        };
    } catch (error) {
        console.error('Import error:', error);
        return {
            success: false,
            recordsAdded: 0,
            recordsSkipped: records.length,
            lastPlayedAt: null,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * 获取用户的流媒体记录数量
 */
export async function getRecordCount(userId: string): Promise<number> {
    const supabase = getSupabase();
    if (!supabase) return 0;

    const { count, error } = await supabase
        .from('streaming_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) {
        console.error('Failed to get record count:', error);
        return 0;
    }

    return count || 0;
}

/**
 * 检查 Supabase 数据同步是否可用
 */
export function isCloudSyncAvailable(): boolean {
    return isSupabaseConfigured();
}
