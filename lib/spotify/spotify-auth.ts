/**
 * lib/spotify/spotify-auth.ts - Spotify OAuth 配置
 * 
 * 使用 expo-auth-session 处理 Spotify OAuth 2.0 PKCE 流程
 */

import { makeRedirectUri } from "expo-auth-session";

// ============================================
// 配置
// ============================================

/**
 * 获取 Spotify Client ID
 * 
 * 虽然 PKCE 流程中 Client ID 本身是公开的，
 * 但在开源项目中最佳实践是通过环境变量管理。
 */
export const getSpotifyClientId = (): string => {
    const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
    if (!clientId) {
        console.warn(
            '⚠️ EXPO_PUBLIC_SPOTIFY_CLIENT_ID 未设置！\n' +
            '请在 .env 文件中配置 Spotify Client ID。\n' +
            '获取方式：https://developer.spotify.com/dashboard'
        );
        return '';
    }
    return clientId;
};

/** Spotify OAuth 端点 */
export const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

/** 请求的权限范围 */
export const SPOTIFY_SCOPES = [
    "user-read-email",           // 读取用户邮箱
    "user-read-private",         // 读取用户资料
    "user-top-read",             // 读取用户 Top Artists 和 Top Tracks
    "user-read-recently-played", // 读取最近播放
];

/**
 * 获取重定向 URI
 * 
 * 在 Expo Go 中使用 exp:// scheme
 * 在生产环境中使用自定义 scheme
 */
export function getRedirectUri(): string {
    return makeRedirectUri({
        scheme: "vibe-consensus",
        path: "spotify-callback",
    });
}

/**
 * Spotify 认证配置
 * 注意：clientId 需要通过函数调用获取
 */
export const getSpotifyAuthConfig = () => ({
    clientId: getSpotifyClientId(),
    scopes: SPOTIFY_SCOPES,
    redirectUri: getRedirectUri(),
    usePKCE: true,
});

/**
 * OAuth Discovery 文档
 * 用于 expo-auth-session 的 useAuthRequest
 */
export const spotifyDiscovery = {
    authorizationEndpoint: SPOTIFY_AUTH_ENDPOINT,
    tokenEndpoint: SPOTIFY_TOKEN_ENDPOINT,
};

// ============================================
// Token 管理
// ============================================

/** 存储的 Token 类型 */
export interface SpotifyTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
}

/**
 * 检查 Token 是否过期
 */
export function isTokenExpired(tokens: SpotifyTokens): boolean {
    // 提前 5 分钟认为过期
    return Date.now() > tokens.expiresAt - 5 * 60 * 1000;
}

/**
 * 从 Token Response 创建 SpotifyTokens
 */
export function createTokens(
    accessToken: string,
    expiresIn: number,
    refreshToken?: string
): SpotifyTokens {
    return {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
    };
}
