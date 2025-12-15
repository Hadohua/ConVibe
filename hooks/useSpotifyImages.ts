/**
 * hooks/useSpotifyImages.ts
 * 
 * React Hook for fetching Spotify images with caching
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getArtistImageUrl,
    getTrackImageUrl,
    getAlbumImageUrl,
    prefetchArtistImages,
    prefetchTrackImages,
} from '../lib/spotify/spotify-image-cache';

// ============================================
// Token 存储
// ============================================

// 使用与 SpotifyConnector 相同的 key
const SPOTIFY_TOKEN_KEY = 'spotify_oauth_tokens';

/**
 * 获取存储的 Spotify access token
 */
async function getStoredToken(): Promise<string | null> {
    try {
        const tokenData = await AsyncStorage.getItem(SPOTIFY_TOKEN_KEY);
        if (!tokenData) return null;

        const parsed = JSON.parse(tokenData);

        // 检查是否过期
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            console.log('Spotify token expired');
            return null;
        }

        return parsed.accessToken || null;
    } catch {
        return null;
    }
}

/**
 * 保存 Spotify access token
 */
export async function saveSpotifyToken(
    accessToken: string,
    expiresIn: number = 3600
): Promise<void> {
    try {
        await AsyncStorage.setItem(SPOTIFY_TOKEN_KEY, JSON.stringify({
            accessToken,
            expiresAt: Date.now() + expiresIn * 1000,
        }));
    } catch (error) {
        console.warn('Failed to save Spotify token:', error);
    }
}

// ============================================
// Hook: useSpotifyToken
// ============================================

/**
 * Hook to get the current Spotify access token
 */
export function useSpotifyToken() {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadToken() {
            const stored = await getStoredToken();
            setToken(stored);
            setIsLoading(false);
        }
        loadToken();
    }, []);

    const refresh = useCallback(async () => {
        const stored = await getStoredToken();
        setToken(stored);
    }, []);

    return { token, isLoading, refresh };
}

// ============================================
// Hook: useArtistImage
// ============================================

/**
 * Hook to get an artist's image URL
 * 
 * @param artistName - Artist name
 * @returns { imageUrl, isLoading }
 */
export function useArtistImage(artistName: string) {
    const [imageUrl, setImageUrl] = useState<string>(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=random&color=fff&size=200&bold=true`
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchImage() {
            const token = await getStoredToken();
            const url = await getArtistImageUrl(artistName, token);

            if (mounted) {
                setImageUrl(url);
                setIsLoading(false);
            }
        }

        fetchImage();

        return () => {
            mounted = false;
        };
    }, [artistName]);

    return { imageUrl, isLoading };
}

// ============================================
// Hook: useTrackImage
// ============================================

/**
 * Hook to get a track's album artwork URL
 */
export function useTrackImage(trackName: string, artistName: string) {
    const [imageUrl, setImageUrl] = useState<string>(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(trackName)}&background=random&color=fff&size=200&bold=true`
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchImage() {
            const token = await getStoredToken();
            const url = await getTrackImageUrl(trackName, artistName, token);

            if (mounted) {
                setImageUrl(url);
                setIsLoading(false);
            }
        }

        fetchImage();

        return () => {
            mounted = false;
        };
    }, [trackName, artistName]);

    return { imageUrl, isLoading };
}

// ============================================
// Hook: useAlbumImage
// ============================================

/**
 * Hook to get an album's cover URL
 */
export function useAlbumImage(albumName: string, artistName: string) {
    const [imageUrl, setImageUrl] = useState<string>(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(albumName)}&background=random&color=fff&size=200&bold=true`
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchImage() {
            const token = await getStoredToken();
            const url = await getAlbumImageUrl(albumName, artistName, token);

            if (mounted) {
                setImageUrl(url);
                setIsLoading(false);
            }
        }

        fetchImage();

        return () => {
            mounted = false;
        };
    }, [albumName, artistName]);

    return { imageUrl, isLoading };
}

// ============================================
// Hook: usePrefetchImages
// ============================================

/**
 * Hook to prefetch images for a list of items
 */
export function usePrefetchImages() {
    const [isPrefetching, setIsPrefetching] = useState(false);
    const [progress, setProgress] = useState(0);

    const prefetchArtists = useCallback(async (artistNames: string[]) => {
        const token = await getStoredToken();
        if (!token) {
            console.log('No Spotify token available for prefetch');
            return;
        }

        setIsPrefetching(true);
        setProgress(0);

        try {
            await prefetchArtistImages(artistNames, token, 5, 100);
            setProgress(100);
        } catch (error) {
            console.warn('Prefetch artists failed:', error);
        } finally {
            setIsPrefetching(false);
        }
    }, []);

    const prefetchTracks = useCallback(async (
        tracks: Array<{ name: string; artistName: string }>
    ) => {
        const token = await getStoredToken();
        if (!token) {
            console.log('No Spotify token available for prefetch');
            return;
        }

        setIsPrefetching(true);
        setProgress(0);

        try {
            await prefetchTrackImages(tracks, token, 5, 100);
            setProgress(100);
        } catch (error) {
            console.warn('Prefetch tracks failed:', error);
        } finally {
            setIsPrefetching(false);
        }
    }, []);

    return { isPrefetching, progress, prefetchArtists, prefetchTracks };
}
