/**
 * lib/spotify/spotify-api.ts - Spotify Web API 调用
 * 
 * 封装 Spotify API 调用，获取用户听歌数据
 */

// ============================================
// 类型定义
// ============================================

/** Spotify 图片 */
export interface SpotifyImage {
    url: string;
    width: number;
    height: number;
}

/** Spotify 艺人 */
export interface SpotifyArtist {
    id: string;
    name: string;
    genres: string[];
    popularity: number;
    images: SpotifyImage[];
    external_urls: {
        spotify: string;
    };
}

/** Spotify 曲目 */
export interface SpotifyTrack {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: {
        id: string;
        name: string;
        images: SpotifyImage[];
    };
    popularity: number;
    duration_ms: number;
}

/** Spotify 用户资料 */
export interface SpotifyUserProfile {
    id: string;
    display_name: string;
    email: string;
    images: SpotifyImage[];
    country: string;
    product: string; // "free" | "premium"
}

/** Top Artists 响应 */
export interface TopArtistsResponse {
    items: SpotifyArtist[];
    total: number;
    limit: number;
    offset: number;
}

/** Top Tracks 响应 */
export interface TopTracksResponse {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
}

/** 时间范围 */
export type TimeRange = "short_term" | "medium_term" | "long_term";

// ============================================
// API 调用
// ============================================

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/**
 * 通用 API 请求
 */
async function spotifyFetch<T>(
    endpoint: string,
    accessToken: string
): Promise<T> {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            `Spotify API Error: ${response.status} - ${error.error?.message || "Unknown error"}`
        );
    }

    return response.json();
}

/**
 * 获取用户资料
 */
export async function getUserProfile(
    accessToken: string
): Promise<SpotifyUserProfile> {
    return spotifyFetch<SpotifyUserProfile>("/me", accessToken);
}

/**
 * 获取用户 Top Artists
 * 
 * @param accessToken - Spotify Access Token
 * @param timeRange - 时间范围
 *   - short_term: 最近 4 周
 *   - medium_term: 最近 6 个月（默认）
 *   - long_term: 全部历史
 * @param limit - 返回数量（1-50）
 */
export async function getTopArtists(
    accessToken: string,
    timeRange: TimeRange = "medium_term",
    limit: number = 10
): Promise<TopArtistsResponse> {
    return spotifyFetch<TopArtistsResponse>(
        `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
        accessToken
    );
}

/**
 * 获取用户 Top Tracks
 */
export async function getTopTracks(
    accessToken: string,
    timeRange: TimeRange = "medium_term",
    limit: number = 10
): Promise<TopTracksResponse> {
    return spotifyFetch<TopTracksResponse>(
        `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
        accessToken
    );
}

/**
 * 提取所有唯一流派
 */
export function extractGenres(artists: SpotifyArtist[]): string[] {
    const genreSet = new Set<string>();
    artists.forEach((artist) => {
        artist.genres.forEach((genre) => genreSet.add(genre));
    });
    return Array.from(genreSet).slice(0, 10); // 最多返回 10 个
}

/**
 * 获取主要流派（出现次数最多的）
 */
export function getTopGenres(artists: SpotifyArtist[], count: number = 5): string[] {
    const genreCount = new Map<string, number>();

    artists.forEach((artist) => {
        artist.genres.forEach((genre) => {
            genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
        });
    });

    return Array.from(genreCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([genre]) => genre);
}
