/**
 * app/(tabs)/verify-spotify.tsx - Spotify 验证页面
 * 
 * 使用 SpotifyConnector 连接 Spotify 获取听歌数据
 * 连接成功后可铸造音乐徽章 SBT
 */

import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import SpotifyConnector from "../../components/SpotifyConnector";
import MintBadgeButton from "../../components/MintBadgeButton";
import type { SpotifyTokens } from "../../lib/spotify/spotify-auth";

interface SpotifyData {
    profile: {
        display_name: string;
        email: string;
    } | null;
    topArtists: Array<{
        name: string;
        genres: string[];
        popularity: number;
    }>;
    topGenres: string[];
}

/**
 * VerifySpotifyScreen - Spotify 验证页面
 */
export default function VerifySpotifyScreen() {
    const [isConnected, setIsConnected] = useState(false);
    const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
    const [mintSuccess, setMintSuccess] = useState(false);

    const handleConnect = (data: SpotifyData, tokens: SpotifyTokens) => {
        console.log("Spotify 已连接:", data);
        setIsConnected(true);
        setSpotifyData(data);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setSpotifyData(null);
        setMintSuccess(false);
    };

    const handleMintSuccess = (txHash: string, mintedGenres: number[]) => {
        console.log("铸造成功:", { txHash, mintedGenres });
        setMintSuccess(true);
    };

    return (
        <ScrollView className="flex-1 bg-dark-50">
            <View className="px-6 pt-16 pb-8">
                {/* 页面标题 */}
                <View className="mb-8">
                    <Text className="text-white text-3xl font-bold">🎵 音乐品味</Text>
                    <Text className="text-gray-400 mt-2">
                        连接 Spotify，铸造你的音乐徽章
                    </Text>
                </View>

                {/* 说明卡片 */}
                <View className="bg-dark-200 rounded-2xl p-6 mb-6">
                    <Text className="text-white text-lg font-semibold mb-3">
                        📖 如何获取音乐徽章
                    </Text>
                    <Text className="text-gray-400 leading-5">
                        1️⃣ 连接你的 Spotify 账户
                        {"\n"}
                        2️⃣ 获取你的音乐流派数据
                        {"\n"}
                        3️⃣ 铸造链上 SBT 徽章
                        {"\n\n"}
                        🏆 徽章将永久存储在区块链上！
                    </Text>
                </View>

                {/* SpotifyConnector 组件 */}
                <SpotifyConnector
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                />

                {/* 连接成功后显示铸造按钮 */}
                {isConnected && spotifyData && spotifyData.topGenres.length > 0 && (
                    <View className="mt-6">
                        {!mintSuccess ? (
                            <>
                                <Text className="text-gray-400 text-sm mb-3">
                                    检测到你的音乐流派：
                                </Text>
                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    {spotifyData.topGenres.slice(0, 5).map((genre, index) => (
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

                                <MintBadgeButton
                                    genres={spotifyData.topGenres}
                                    onSuccess={handleMintSuccess}
                                    onError={(error) => console.error("铸造失败:", error)}
                                />
                            </>
                        ) : (
                            <View className="bg-green-900/30 rounded-2xl p-6 border border-green-700/50">
                                <Text className="text-green-400 text-lg font-semibold mb-2">
                                    🎉 恭喜！
                                </Text>
                                <Text className="text-gray-300 leading-5">
                                    你的音乐徽章已铸造成功！
                                    {"\n"}
                                    这是一个灵魂绑定代币 (SBT)，无法转让，永久属于你。
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* 隐私说明 */}
                <View className="mt-6 bg-dark-200/50 rounded-xl p-4">
                    <Text className="text-gray-500 text-xs text-center leading-4">
                        🔒 我们只读取你的公开听歌数据。
                        {"\n"}
                        铸造需要少量 Gas 费（测试网免费）。
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
