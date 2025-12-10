/**
 * lib/spotify/streaming-history-parser.ts
 * 
 * Spotify 数据导出 JSON 解析器
 * 解析 Streaming_History_Audio_*.json 文件，生成统计数据
 */

// ============================================
// 类型定义
// ============================================

/** Spotify 数据导出中的单条播放记录 */
export interface StreamingRecord {
    ts: string;                                    // 播放时间戳 ISO 8601
    ms_played: number;                             // 播放时长（毫秒）
    master_metadata_track_name: string | null;     // 歌曲名
    master_metadata_album_artist_name: string | null; // 艺人名
    master_metadata_album_album_name: string | null;  // 专辑名
    spotify_track_uri: string | null;              // Track URI
    reason_start?: string;                         // 开始原因
    reason_end?: string;                           // 结束原因
}

/** 歌曲统计 */
export interface TrackStats {
    name: string;
    artistName: string;
    albumName: string;
    totalMs: number;
    totalMinutes: number;
    streamCount: number;
    uri: string | null;
}

/** 艺人统计 */
export interface ArtistStats {
    name: string;
    totalMs: number;
    totalMinutes: number;
    totalHours: number;
    streamCount: number;
    topTracks: TrackStats[];
}

/** 整体统计结果 */
export interface StreamingStats {
    // 总体统计
    totalStreams: number;
    totalMs: number;
    totalMinutes: number;
    totalHours: number;
    uniqueArtists: number;
    uniqueTracks: number;

    // 时间范围
    firstStream: string | null;
    lastStream: string | null;

    // 排行榜
    topArtists: ArtistStats[];
    topTracks: TrackStats[];

    // 导入时间
    importedAt: number;
}

// ============================================
// 解析函数
// ============================================

/**
 * 解析 Spotify 流媒体历史 JSON 数据
 * 
 * @param jsonContent - JSON 文件内容（字符串或已解析的数组）
 * @returns 统计结果
 */
export function parseStreamingHistory(
    jsonContent: string | StreamingRecord[]
): StreamingStats {
    // 解析 JSON
    const records: StreamingRecord[] = typeof jsonContent === 'string'
        ? JSON.parse(jsonContent)
        : jsonContent;

    // 用于聚合的 Map
    const artistMap = new Map<string, {
        totalMs: number;
        streamCount: number;
        tracks: Map<string, {
            totalMs: number;
            streamCount: number;
            albumName: string;
            uri: string | null;
        }>;
    }>();

    const trackMap = new Map<string, {
        name: string;
        artistName: string;
        albumName: string;
        totalMs: number;
        streamCount: number;
        uri: string | null;
    }>();

    let firstStream: string | null = null;
    let lastStream: string | null = null;
    let validStreams = 0;
    let totalMs = 0;

    // 遍历所有记录
    for (const record of records) {
        // 跳过无效记录
        if (!record.master_metadata_track_name || !record.master_metadata_album_artist_name) {
            continue;
        }

        // 跳过播放时间过短的记录 (< 30秒)
        if (record.ms_played < 30000) {
            continue;
        }

        validStreams++;
        totalMs += record.ms_played;

        // 更新时间范围
        if (!firstStream || record.ts < firstStream) {
            firstStream = record.ts;
        }
        if (!lastStream || record.ts > lastStream) {
            lastStream = record.ts;
        }

        const artistName = record.master_metadata_album_artist_name;
        const trackName = record.master_metadata_track_name;
        const albumName = record.master_metadata_album_album_name || 'Unknown Album';
        const trackKey = `${artistName}::${trackName}`;

        // 更新艺人统计
        if (!artistMap.has(artistName)) {
            artistMap.set(artistName, {
                totalMs: 0,
                streamCount: 0,
                tracks: new Map(),
            });
        }
        const artistData = artistMap.get(artistName)!;
        artistData.totalMs += record.ms_played;
        artistData.streamCount++;

        // 更新艺人的歌曲统计
        if (!artistData.tracks.has(trackName)) {
            artistData.tracks.set(trackName, {
                totalMs: 0,
                streamCount: 0,
                albumName,
                uri: record.spotify_track_uri,
            });
        }
        const artistTrack = artistData.tracks.get(trackName)!;
        artistTrack.totalMs += record.ms_played;
        artistTrack.streamCount++;

        // 更新全局歌曲统计
        if (!trackMap.has(trackKey)) {
            trackMap.set(trackKey, {
                name: trackName,
                artistName,
                albumName,
                totalMs: 0,
                streamCount: 0,
                uri: record.spotify_track_uri,
            });
        }
        const trackData = trackMap.get(trackKey)!;
        trackData.totalMs += record.ms_played;
        trackData.streamCount++;
    }

    // 构建 Top Artists
    const topArtists: ArtistStats[] = Array.from(artistMap.entries())
        .map(([name, data]) => ({
            name,
            totalMs: data.totalMs,
            totalMinutes: Math.round(data.totalMs / 60000),
            totalHours: Math.round(data.totalMs / 3600000 * 10) / 10,
            streamCount: data.streamCount,
            topTracks: Array.from(data.tracks.entries())
                .map(([trackName, trackData]) => ({
                    name: trackName,
                    artistName: name,
                    albumName: trackData.albumName,
                    totalMs: trackData.totalMs,
                    totalMinutes: Math.round(trackData.totalMs / 60000),
                    streamCount: trackData.streamCount,
                    uri: trackData.uri,
                }))
                .sort((a, b) => b.totalMs - a.totalMs)
                .slice(0, 5),
        }))
        .sort((a, b) => b.totalMs - a.totalMs)
        .slice(0, 50); // Top 50 艺人

    // 构建 Top Tracks
    const topTracks: TrackStats[] = Array.from(trackMap.values())
        .sort((a, b) => b.streamCount - a.streamCount)
        .slice(0, 50) // Top 50 歌曲
        .map(t => ({
            ...t,
            totalMinutes: Math.round(t.totalMs / 60000),
        }));

    return {
        totalStreams: validStreams,
        totalMs,
        totalMinutes: Math.round(totalMs / 60000),
        totalHours: Math.round(totalMs / 3600000 * 10) / 10,
        uniqueArtists: artistMap.size,
        uniqueTracks: trackMap.size,
        firstStream,
        lastStream,
        topArtists,
        topTracks,
        importedAt: Date.now(),
    };
}

/**
 * 合并多个统计结果（用于导入多个 JSON 文件）
 */
export function mergeStreamingStats(statsList: StreamingStats[]): StreamingStats {
    if (statsList.length === 0) {
        return {
            totalStreams: 0,
            totalMs: 0,
            totalMinutes: 0,
            totalHours: 0,
            uniqueArtists: 0,
            uniqueTracks: 0,
            firstStream: null,
            lastStream: null,
            topArtists: [],
            topTracks: [],
            importedAt: Date.now(),
        };
    }

    if (statsList.length === 1) {
        return statsList[0];
    }

    // 简单合并 - 对于 MVP 足够
    const merged = statsList.reduce((acc, stats) => ({
        totalStreams: acc.totalStreams + stats.totalStreams,
        totalMs: acc.totalMs + stats.totalMs,
        totalMinutes: acc.totalMinutes + stats.totalMinutes,
        totalHours: acc.totalHours + stats.totalHours,
        uniqueArtists: acc.uniqueArtists + stats.uniqueArtists, // 可能有重复，但 MVP 足够
        uniqueTracks: acc.uniqueTracks + stats.uniqueTracks,
        firstStream: !acc.firstStream || (stats.firstStream && stats.firstStream < acc.firstStream)
            ? stats.firstStream : acc.firstStream,
        lastStream: !acc.lastStream || (stats.lastStream && stats.lastStream > acc.lastStream)
            ? stats.lastStream : acc.lastStream,
        topArtists: [...acc.topArtists, ...stats.topArtists],
        topTracks: [...acc.topTracks, ...stats.topTracks],
        importedAt: Date.now(),
    }));

    // 重新排序并截断
    merged.topArtists = merged.topArtists
        .sort((a, b) => b.totalMs - a.totalMs)
        .slice(0, 50);
    merged.topTracks = merged.topTracks
        .sort((a, b) => b.streamCount - a.streamCount)
        .slice(0, 50);

    return merged;
}

/**
 * 根据播放时长计算品味浓度等级
 * 
 * 规则：
 * - 某艺人播放时长 >= 10小时 → OG (3)
 * - 某艺人播放时长 >= 3小时 → VETERAN (2)
 * - 其他 → ENTRY (1)
 */
export function calculateTierFromPlaytime(hoursPlayed: number): 1 | 2 | 3 {
    if (hoursPlayed >= 10) return 3; // OG
    if (hoursPlayed >= 3) return 2;  // VETERAN
    return 1; // ENTRY
}

// ============================================
// 时间范围过滤
// ============================================

/**
 * 根据日期范围过滤播放记录
 * 
 * @param records - 原始播放记录数组
 * @param startDate - 开始日期（包含），null 表示不限
 * @param endDate - 结束日期（包含），null 表示不限
 * @returns 过滤后的记录数组
 */
export function filterRecordsByDateRange(
    records: StreamingRecord[],
    startDate: Date | null,
    endDate: Date | null
): StreamingRecord[] {
    if (!startDate && !endDate) {
        return records;
    }

    return records.filter(record => {
        const recordDate = new Date(record.ts);

        if (startDate && recordDate < startDate) {
            return false;
        }
        if (endDate) {
            // 包含结束日期的整天
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            if (recordDate > endOfDay) {
                return false;
            }
        }
        return true;
    });
}

/**
 * 解析带时间范围过滤的统计数据
 * 
 * @param records - 原始播放记录数组
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 */
export function parseStreamingHistoryWithFilter(
    records: StreamingRecord[],
    startDate: Date | null,
    endDate: Date | null
): StreamingStats {
    const filtered = filterRecordsByDateRange(records, startDate, endDate);
    return parseStreamingHistory(filtered);
}

// ============================================
// 排序工具函数
// ============================================

export type SortMetric = 'streamCount' | 'totalMs';

/**
 * 根据指定指标排序曲目列表
 */
export function sortTracksByMetric(tracks: TrackStats[], metric: SortMetric): TrackStats[] {
    return [...tracks].sort((a, b) => {
        if (metric === 'streamCount') {
            return b.streamCount - a.streamCount;
        }
        return b.totalMs - a.totalMs;
    });
}

/**
 * 根据指定指标排序艺人列表
 */
export function sortArtistsByMetric(artists: ArtistStats[], metric: SortMetric): ArtistStats[] {
    return [...artists].sort((a, b) => {
        if (metric === 'streamCount') {
            return b.streamCount - a.streamCount;
        }
        return b.totalMs - a.totalMs;
    });
}

// ============================================
// 数据库查询统计
// ============================================

import { getSupabase } from '../supabase/client';

/** 数据库记录格式 */
interface DbStreamingRecord {
    ts: string;
    ms_played: number;
    track_name: string | null;
    artist_name: string | null;
    album_name: string | null;
    spotify_track_uri: string | null;
    source: 'json_import' | 'api_sync';
}

/**
 * 从 Supabase 数据库查询记录并计算统计
 * 
 * @param userId - 用户 ID (钱包地址)
 * @param startDate - 可选，开始日期
 * @param endDate - 可选，结束日期
 * @returns 统计结果，若数据库未配置或无数据则返回 null
 */
export async function getStatsFromDatabase(
    userId: string,
    startDate?: Date,
    endDate?: Date
): Promise<StreamingStats | null> {
    const supabase = getSupabase();
    if (!supabase) {
        console.log('Supabase not configured, cannot get stats from database');
        return null;
    }

    try {
        // 构建查询
        let query = supabase
            .from('streaming_records')
            .select('ts, ms_played, track_name, artist_name, album_name, spotify_track_uri, source')
            .eq('user_id', userId)
            .order('ts', { ascending: false });

        // 添加日期范围过滤
        if (startDate) {
            query = query.gte('ts', startDate.toISOString());
        }
        if (endDate) {
            // 包含结束日期的整天
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            query = query.lte('ts', endOfDay.toISOString());
        }

        const { data, error } = await query;

        if (error) {
            console.error('Failed to fetch records from database:', error);
            return null;
        }

        if (!data || data.length === 0) {
            console.log('No records found in database');
            return null;
        }

        // 将数据库记录转换为 StreamingRecord 格式
        const records: StreamingRecord[] = (data as DbStreamingRecord[]).map(row => ({
            ts: row.ts,
            ms_played: row.ms_played,
            master_metadata_track_name: row.track_name,
            master_metadata_album_artist_name: row.artist_name,
            master_metadata_album_album_name: row.album_name,
            spotify_track_uri: row.spotify_track_uri,
        }));

        // 使用现有的解析函数计算统计
        const stats = parseStreamingHistory(records);

        return stats;
    } catch (error) {
        console.error('getStatsFromDatabase error:', error);
        return null;
    }
}

