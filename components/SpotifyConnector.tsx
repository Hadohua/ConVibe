/**
 * components/SpotifyConnector.tsx - Spotify OAuth 连接组件
 * 
 * 使用 Spotify OAuth 直接获取用户听歌数据
 */

import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, Image, ScrollView } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
    getSpotifyClientId,
    SPOTIFY_SCOPES,
    spotifyDiscovery,
    createTokens,
    type SpotifyTokens,
} from "../lib/spotify/spotify-auth";
import {
    getUserProfile,
    getTopArtists,
    getTopGenres,
    type SpotifyArtist,
    type SpotifyUserProfile,
} from "../lib/spotify/spotify-api";

// 确保 WebBrowser 能正确处理回调
WebBrowser.maybeCompleteAuthSession();

// ============================================
// 类型定义
// ============================================

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface SpotifyData {
    profile: SpotifyUserProfile | null;
    topArtists: SpotifyArtist[];
    topGenres: string[];
}

interface SpotifyConnectorProps {
    onConnect?: (data: SpotifyData, tokens: SpotifyTokens) => void;
    onDisconnect?: () => void;
}

// ============================================
// SpotifyConnector 组件
// ============================================

export default function SpotifyConnector({
    onConnect,
    onDisconnect,
}: SpotifyConnectorProps) {
    // 状态
    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
    const [spotifyData, setSpotifyData] = useState<SpotifyData>({
        profile: null,
        topArtists: [],
        topGenres: [],
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 生成 Redirect URI - Expo Go 需要使用特定格式
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: "vibe-consensus",
    });

    // 调试：打印实际的 Redirect URI
    useEffect(() => {
        console.log("=== Spotify OAuth Redirect URI ===");
        console.log(redirectUri);
        console.log("请将此 URI 添加到 Spotify Developer Dashboard!");
    }, [redirectUri]);

    // OAuth 请求配置
    const clientId = getSpotifyClientId();
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId,
            scopes: SPOTIFY_SCOPES,
            usePKCE: true,
            redirectUri,
        },
        spotifyDiscovery
    );

    // 处理 OAuth 响应
    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;
            exchangeCodeForToken(code);
        } else if (response?.type === "error") {
            setStatus("error");
            setErrorMessage(response.error?.message || "授权失败");
        }
    }, [response]);

    /**
     * 用授权码换取 Access Token
     */
    const exchangeCodeForToken = async (code: string) => {
        try {
            setStatus("connecting");

            const tokenResponse = await AuthSession.exchangeCodeAsync(
                {
                    clientId: getSpotifyClientId(),
                    code,
                    redirectUri,
                    extraParams: {
                        code_verifier: request?.codeVerifier || "",
                    },
                },
                spotifyDiscovery
            );

            const newTokens = createTokens(
                tokenResponse.accessToken,
                tokenResponse.expiresIn || 3600,
                tokenResponse.refreshToken
            );

            setTokens(newTokens);
            await fetchSpotifyData(newTokens.accessToken, newTokens);
        } catch (error) {
            console.error("Token 交换失败:", error);
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "获取 Token 失败");
        }
    };

    /**
     * 获取 Spotify 数据
     */
    const fetchSpotifyData = async (accessToken: string, passedTokens?: SpotifyTokens) => {
        try {
            console.log("正在获取 Spotify 数据...");

            // 并行获取用户资料和 Top Artists
            const [profile, topArtistsResponse] = await Promise.all([
                getUserProfile(accessToken),
                getTopArtists(accessToken, "medium_term", 10),
            ]);

            const topArtists = topArtistsResponse.items;
            const topGenres = getTopGenres(topArtists, 5);

            const data: SpotifyData = {
                profile,
                topArtists,
                topGenres,
            };

            setSpotifyData(data);
            setStatus("connected");

            // 回调 - 使用传入的 tokens 或状态中的 tokens
            const tokensToUse = passedTokens || tokens;
            if (tokensToUse) {
                onConnect?.(data, tokensToUse);
            }

            console.log("Spotify 数据获取成功:", {
                user: profile.display_name,
                artistCount: topArtists.length,
                genres: topGenres,
            });
        } catch (error) {
            console.error("获取 Spotify 数据失败:", error);
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "获取数据失败");
        }
    };

    /**
     * 开始 OAuth 流程
     */
    const handleConnect = useCallback(async () => {
        setStatus("connecting");
        setErrorMessage(null);
        await promptAsync();
    }, [promptAsync]);

    /**
     * 断开连接
     */
    const handleDisconnect = useCallback(() => {
        setStatus("disconnected");
        setTokens(null);
        setSpotifyData({
            profile: null,
            topArtists: [],
            topGenres: [],
        });
        onDisconnect?.();
    }, [onDisconnect]);

    // ============================================
    // 渲染
    // ============================================

    return (
        <View className="bg-dark-200 rounded-2xl overflow-hidden">
            {/* 头部 */}
            <View className="p-6 border-b border-dark-50/50">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center mr-3">
                        <Text className="text-white text-lg">🎵</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">
                            Spotify 连接
                        </Text>
                        <Text className="text-gray-400 text-sm">
                            {status === "connected"
                                ? `已连接: ${spotifyData.profile?.display_name}`
                                : "连接你的 Spotify 账户"}
                        </Text>
                    </View>

                    {/* 状态指示器 */}
                    {status === "connected" && (
                        <View className="bg-green-600 w-8 h-8 rounded-full items-center justify-center">
                            <Text className="text-white">✓</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 内容 */}
            <View className="p-6">
                {/* 未连接状态 */}
                {status === "disconnected" && (
                    <View>
                        <Text className="text-gray-400 mb-4 leading-5">
                            连接 Spotify 获取你的音乐品味数据，包括最爱的艺人和流派。
                        </Text>

                        <Pressable
                            onPress={handleConnect}
                            disabled={!request}
                            className="bg-green-600 py-4 rounded-xl"
                            style={({ pressed }) => [
                                { transform: [{ scale: pressed ? 0.98 : 1 }] },
                            ]}
                        >
                            <View className="flex-row items-center justify-center">
                                <Text className="text-2xl mr-2">🎧</Text>
                                <Text className="text-white font-semibold text-lg">
                                    连接 Spotify
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                )}

                {/* 连接中状态 */}
                {status === "connecting" && (
                    <View className="items-center py-6">
                        <ActivityIndicator size="large" color="#22c55e" />
                        <Text className="text-white mt-4">连接中...</Text>
                    </View>
                )}

                {/* 已连接状态 */}
                {status === "connected" && (
                    <View>
                        {/* 用户信息 */}
                        {spotifyData.profile && (
                            <View className="flex-row items-center mb-4 pb-4 border-b border-dark-50/50">
                                {spotifyData.profile.images?.[0] && (
                                    <Image
                                        source={{ uri: spotifyData.profile.images[0].url }}
                                        className="w-12 h-12 rounded-full mr-3"
                                    />
                                )}
                                <View>
                                    <Text className="text-white font-semibold">
                                        {spotifyData.profile.display_name}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">
                                        {spotifyData.profile.product === "premium" ? "Premium" : "Free"} 会员
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* 流派标签 */}
                        {spotifyData.topGenres.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-400 text-sm mb-2">你的流派</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View className="flex-row gap-2">
                                        {spotifyData.topGenres.map((genre, index) => (
                                            <View
                                                key={index}
                                                className="bg-primary-900/50 px-3 py-1 rounded-full border border-primary-700/50"
                                            >
                                                <Text className="text-primary-400 text-sm capitalize">
                                                    {genre}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        {/* Top Artists */}
                        {spotifyData.topArtists.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-400 text-sm mb-2">Top Artists</Text>
                                {spotifyData.topArtists.slice(0, 5).map((artist, index) => (
                                    <View
                                        key={artist.id}
                                        className="flex-row items-center py-2 border-b border-dark-50/30"
                                    >
                                        <Text className="text-gray-500 w-6">#{index + 1}</Text>
                                        {artist.images?.[0] && (
                                            <Image
                                                source={{ uri: artist.images[0].url }}
                                                className="w-10 h-10 rounded-full mr-3"
                                            />
                                        )}
                                        <View className="flex-1">
                                            <Text className="text-white font-medium">{artist.name}</Text>
                                            <Text className="text-gray-500 text-xs">
                                                热度: {artist.popularity}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* 断开连接 */}
                        <Pressable
                            onPress={handleDisconnect}
                            className="py-3 rounded-xl bg-dark-50"
                        >
                            <Text className="text-gray-400 text-center">断开连接</Text>
                        </Pressable>
                    </View>
                )}

                {/* 错误状态 */}
                {status === "error" && (
                    <View>
                        <View className="bg-red-900/30 rounded-xl p-4 mb-4 border border-red-700/50">
                            <Text className="text-red-400 font-semibold mb-2">连接失败</Text>
                            <Text className="text-gray-300 text-sm">{errorMessage}</Text>
                        </View>

                        <Pressable
                            onPress={handleConnect}
                            className="py-3 rounded-xl bg-primary-600"
                        >
                            <Text className="text-white text-center font-semibold">重试</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}
