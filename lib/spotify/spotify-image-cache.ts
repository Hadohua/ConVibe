/**
 * lib/spotify/spotify-image-cache.ts
 * 
 * Spotify 图片缓存服务
 * - 从 Spotify API 搜索获取艺人/专辑封面
 * - 本地缓存减少 API 调用
 * - 支持批量预加载
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// 类型定义
// ============================================

interface ImageCacheEntry {
    url: string;
    fetchedAt: number;
}

interface ImageCache {
    artists: Record<string, ImageCacheEntry>;
    albums: Record<string, ImageCacheEntry>;
    tracks: Record<string, ImageCacheEntry>;
}

interface SpotifySearchArtistResult {
    artists: {
        items: Array<{
            id: string;
            name: string;
            images: Array<{ url: string; width: number; height: number }>;
        }>;
    };
}

interface SpotifySearchAlbumResult {
    albums: {
        items: Array<{
            id: string;
            name: string;
            artists: Array<{ name: string }>;
            images: Array<{ url: string; width: number; height: number }>;
        }>;
    };
}

interface SpotifySearchTrackResult {
    tracks: {
        items: Array<{
            id: string;
            name: string;
            artists: Array<{ name: string }>;
            album: {
                images: Array<{ url: string; width: number; height: number }>;
            };
        }>;
    };
}

// ============================================
// 常量
// ============================================

const CACHE_KEY = '@vibe_consensus/spotify_image_cache';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 天
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// 内存缓存
let memoryCache: ImageCache | null = null;

// ============================================
// 缓存管理
// ============================================

/**
 * 加载图片缓存
 */
async function loadCache(): Promise<ImageCache> {
    if (memoryCache) return memoryCache;

    try {
        const stored = await AsyncStorage.getItem(CACHE_KEY);
        if (stored) {
            memoryCache = JSON.parse(stored);
            return memoryCache!;
        }
    } catch (error) {
        console.warn('Failed to load image cache:', error);
    }

    memoryCache = { artists: {}, albums: {}, tracks: {} };
    return memoryCache;
}

/**
 * 保存缓存
 */
async function saveCache(): Promise<void> {
    if (!memoryCache) return;

    try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
    } catch (error) {
        console.warn('Failed to save image cache:', error);
    }
}

/**
 * 清除过期缓存
 */
async function cleanExpiredCache(): Promise<void> {
    const cache = await loadCache();
    const now = Date.now();

    let hasChanges = false;

    for (const type of ['artists', 'albums', 'tracks'] as const) {
        for (const key of Object.keys(cache[type])) {
            if (now - cache[type][key].fetchedAt > CACHE_EXPIRY_MS) {
                delete cache[type][key];
                hasChanges = true;
            }
        }
    }

    if (hasChanges) {
        await saveCache();
    }
}

// ============================================
// Spotify API 搜索
// ============================================

/**
 * 搜索艺人图片
 */
async function searchArtistImage(
    artistName: string,
    accessToken: string
): Promise<string | null> {
    try {
        const query = encodeURIComponent(artistName);
        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=artist:${query}&type=artist&limit=1`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!response.ok) return null;

        const data: SpotifySearchArtistResult = await response.json();
        const artist = data.artists?.items?.[0];

        if (artist?.images?.length > 0) {
            // 优先选择 300px 左右的图片
            const image = artist.images.find(img => img.width >= 200 && img.width <= 400)
                || artist.images[0];
            return image.url;
        }
        return null;
    } catch (error) {
        console.warn('Search artist image failed:', artistName, error);
        return null;
    }
}

/**
 * 搜索专辑封面
 */
async function searchAlbumImage(
    albumName: string,
    artistName: string,
    accessToken: string
): Promise<string | null> {
    try {
        const query = encodeURIComponent(`album:${albumName} artist:${artistName}`);
        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=${query}&type=album&limit=1`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!response.ok) return null;

        const data: SpotifySearchAlbumResult = await response.json();
        const album = data.albums?.items?.[0];

        if (album?.images?.length > 0) {
            const image = album.images.find(img => img.width >= 200 && img.width <= 400)
                || album.images[0];
            return image.url;
        }
        return null;
    } catch (error) {
        console.warn('Search album image failed:', albumName, error);
        return null;
    }
}

/**
 * 搜索歌曲封面（使用专辑封面）
 */
async function searchTrackImage(
    trackName: string,
    artistName: string,
    accessToken: string
): Promise<string | null> {
    try {
        const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=${query}&type=track&limit=1`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!response.ok) return null;

        const data: SpotifySearchTrackResult = await response.json();
        const track = data.tracks?.items?.[0];

        if (track?.album?.images?.length > 0) {
            const image = track.album.images.find(img => img.width >= 200 && img.width <= 400)
                || track.album.images[0];
            return image.url;
        }
        return null;
    } catch (error) {
        console.warn('Search track image failed:', trackName, error);
        return null;
    }
}

// ============================================
// 公开 API
// ============================================

/**
 * 获取艺人图片 URL
 * 
 * @param artistName - 艺人名称
 * @param accessToken - 可选，Spotify access token（有则从 API 获取，无则返回占位图）
 * @returns 图片 URL
 */
export async function getArtistImageUrl(
    artistName: string,
    accessToken?: string | null
): Promise<string> {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=random&color=fff&size=200&bold=true`;

    if (!accessToken) return fallbackUrl;

    const cache = await loadCache();
    const cacheKey = artistName.toLowerCase();

    // 检查缓存
    const cached = cache.artists[cacheKey];
    if (cached && Date.now() - cached.fetchedAt < CACHE_EXPIRY_MS) {
        return cached.url;
    }

    // 从 API 获取
    const imageUrl = await searchArtistImage(artistName, accessToken);

    if (imageUrl) {
        cache.artists[cacheKey] = { url: imageUrl, fetchedAt: Date.now() };
        await saveCache();
        return imageUrl;
    }

    return fallbackUrl;
}

/**
 * 获取专辑封面 URL
 */
export async function getAlbumImageUrl(
    albumName: string,
    artistName: string,
    accessToken?: string | null
): Promise<string> {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(albumName)}&background=random&color=fff&size=200&bold=true`;

    if (!accessToken) return fallbackUrl;

    const cache = await loadCache();
    const cacheKey = `${albumName}::${artistName}`.toLowerCase();

    // 检查缓存
    const cached = cache.albums[cacheKey];
    if (cached && Date.now() - cached.fetchedAt < CACHE_EXPIRY_MS) {
        return cached.url;
    }

    // 从 API 获取
    const imageUrl = await searchAlbumImage(albumName, artistName, accessToken);

    if (imageUrl) {
        cache.albums[cacheKey] = { url: imageUrl, fetchedAt: Date.now() };
        await saveCache();
        return imageUrl;
    }

    return fallbackUrl;
}

/**
 * 获取歌曲封面 URL
 */
export async function getTrackImageUrl(
    trackName: string,
    artistName: string,
    accessToken?: string | null
): Promise<string> {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(trackName)}&background=random&color=fff&size=200&bold=true`;

    if (!accessToken) return fallbackUrl;

    const cache = await loadCache();
    const cacheKey = `${trackName}::${artistName}`.toLowerCase();

    // 检查缓存
    const cached = cache.tracks[cacheKey];
    if (cached && Date.now() - cached.fetchedAt < CACHE_EXPIRY_MS) {
        return cached.url;
    }

    // 从 API 获取
    const imageUrl = await searchTrackImage(trackName, artistName, accessToken);

    if (imageUrl) {
        cache.tracks[cacheKey] = { url: imageUrl, fetchedAt: Date.now() };
        await saveCache();
        return imageUrl;
    }

    return fallbackUrl;
}

/**
 * 预加载多个艺人图片
 * 
 * @param artistNames - 艺人名称列表
 * @param accessToken - Spotify access token
 * @param batchSize - 每批处理数量（避免 rate limit）
 * @param delayMs - 每批之间的延迟
 */
export async function prefetchArtistImages(
    artistNames: string[],
    accessToken: string,
    batchSize: number = 5,
    delayMs: number = 100
): Promise<void> {
    const cache = await loadCache();

    // 过滤已缓存的
    const uncached = artistNames.filter(name => {
        const cached = cache.artists[name.toLowerCase()];
        return !cached || Date.now() - cached.fetchedAt > CACHE_EXPIRY_MS;
    });

    console.log(`Prefetching ${uncached.length} artist images...`);

    for (let i = 0; i < uncached.length; i += batchSize) {
        const batch = uncached.slice(i, i + batchSize);
        await Promise.all(batch.map(name => getArtistImageUrl(name, accessToken)));

        if (i + batchSize < uncached.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    console.log('Artist images prefetch complete');
}

/**
 * 预加载多个歌曲封面
 */
export async function prefetchTrackImages(
    tracks: Array<{ name: string; artistName: string }>,
    accessToken: string,
    batchSize: number = 5,
    delayMs: number = 100
): Promise<void> {
    const cache = await loadCache();

    const uncached = tracks.filter(track => {
        const cacheKey = `${track.name}::${track.artistName}`.toLowerCase();
        const cached = cache.tracks[cacheKey];
        return !cached || Date.now() - cached.fetchedAt > CACHE_EXPIRY_MS;
    });

    console.log(`Prefetching ${uncached.length} track images...`);

    for (let i = 0; i < uncached.length; i += batchSize) {
        const batch = uncached.slice(i, i + batchSize);
        await Promise.all(batch.map(t => getTrackImageUrl(t.name, t.artistName, accessToken)));

        if (i + batchSize < uncached.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    console.log('Track images prefetch complete');
}

/**
 * 清除所有图片缓存
 */
export async function clearImageCache(): Promise<void> {
    memoryCache = { artists: {}, albums: {}, tracks: {} };
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('Image cache cleared');
}

/**
 * 获取缓存统计
 */
export async function getImageCacheStats(): Promise<{
    artistCount: number;
    albumCount: number;
    trackCount: number;
}> {
    const cache = await loadCache();
    return {
        artistCount: Object.keys(cache.artists).length,
        albumCount: Object.keys(cache.albums).length,
        trackCount: Object.keys(cache.tracks).length,
    };
}

// 启动时清理过期缓存
cleanExpiredCache().catch(console.warn);
