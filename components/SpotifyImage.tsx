/**
 * components/SpotifyImage.tsx
 * 
 * 自动从 Spotify API 获取封面图片的组件
 * 支持艺人、专辑、歌曲三种类型
 */

import React, { useState, useEffect } from 'react';
import { Image, View, ImageStyle, StyleProp } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// 类型定义
// ============================================

type ImageType = 'artist' | 'album' | 'track';

interface SpotifyImageProps {
    type: ImageType;
    name: string;
    artistName?: string; // 专辑和歌曲需要
    size?: number;
    style?: StyleProp<ImageStyle>;
    className?: string;
}

// ============================================
// 缓存常量
// ============================================

const CACHE_KEY = '@vibe_consensus/spotify_image_cache';
// 使用与 SpotifyConnector 相同的 key
const SPOTIFY_TOKEN_KEY = 'spotify_oauth_tokens';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// 内存缓存
const memoryImageCache: Record<string, string> = {};

// ============================================
// 工具函数
// ============================================

function getFallbackUrl(name: string, size: number): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=${size}&bold=true`;
}

async function getStoredToken(): Promise<string | null> {
    try {
        const tokenData = await AsyncStorage.getItem(SPOTIFY_TOKEN_KEY);
        if (!tokenData) return null;
        const parsed = JSON.parse(tokenData);
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
        return parsed.accessToken || null;
    } catch {
        return null;
    }
}

async function loadImageCache(): Promise<Record<string, string>> {
    try {
        const stored = await AsyncStorage.getItem(CACHE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // 合并到内存缓存
            Object.assign(memoryImageCache, parsed.urls || {});
        }
    } catch { }
    return memoryImageCache;
}

async function saveToCache(key: string, url: string): Promise<void> {
    memoryImageCache[key] = url;
    try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            urls: memoryImageCache,
            updatedAt: Date.now(),
        }));
    } catch { }
}

async function searchSpotifyImage(
    type: ImageType,
    name: string,
    artistName: string | undefined,
    token: string
): Promise<string | null> {
    try {
        let query = '';
        let searchType = '';

        if (type === 'artist') {
            query = `artist:${name}`;
            searchType = 'artist';
        } else if (type === 'album') {
            query = artistName ? `album:${name} artist:${artistName}` : `album:${name}`;
            searchType = 'album';
        } else {
            query = artistName ? `track:${name} artist:${artistName}` : `track:${name}`;
            searchType = 'track';
        }

        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=${searchType}&limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) return null;

        const data = await response.json();

        if (type === 'artist' && data.artists?.items?.[0]?.images?.[0]) {
            return data.artists.items[0].images[0].url;
        }
        if (type === 'album' && data.albums?.items?.[0]?.images?.[0]) {
            return data.albums.items[0].images[0].url;
        }
        if (type === 'track' && data.tracks?.items?.[0]?.album?.images?.[0]) {
            return data.tracks.items[0].album.images[0].url;
        }

        return null;
    } catch {
        return null;
    }
}

// ============================================
// SpotifyImage 组件
// ============================================

export default function SpotifyImage({
    type,
    name,
    artistName,
    size = 200,
    style,
    className,
}: SpotifyImageProps) {
    const [imageUrl, setImageUrl] = useState<string>(getFallbackUrl(name, size));
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function fetchImage() {
            // 生成缓存 key
            const cacheKey = type === 'artist'
                ? `artist:${name.toLowerCase()}`
                : `${type}:${name.toLowerCase()}:${(artistName || '').toLowerCase()}`;

            // 检查内存缓存
            await loadImageCache();
            if (memoryImageCache[cacheKey]) {
                if (mounted) {
                    setImageUrl(memoryImageCache[cacheKey]);
                    setHasLoaded(true);
                }
                return;
            }

            // 获取 token
            const token = await getStoredToken();
            if (!token) {
                if (mounted) setHasLoaded(true);
                return;
            }

            // 从 API 搜索
            const url = await searchSpotifyImage(type, name, artistName, token);

            if (url && mounted) {
                setImageUrl(url);
                await saveToCache(cacheKey, url);
            }

            if (mounted) setHasLoaded(true);
        }

        fetchImage();

        return () => {
            mounted = false;
        };
    }, [type, name, artistName, size]);

    return (
        <Image
            source={{ uri: imageUrl }}
            style={style}
            className={className}
            resizeMode="cover"
        />
    );
}

// ============================================
// 快捷组件
// ============================================

export function ArtistImage(props: Omit<SpotifyImageProps, 'type'>) {
    return <SpotifyImage {...props} type="artist" />;
}

export function AlbumImage(props: Omit<SpotifyImageProps, 'type'>) {
    return <SpotifyImage {...props} type="album" />;
}

export function TrackImage(props: Omit<SpotifyImageProps, 'type'>) {
    return <SpotifyImage {...props} type="track" />;
}
