/**
 * app/(music-vibe)/mine.tsx - Web3 Hub 页面
 * 
 * 音乐资产管理中心（从 profile.tsx 和 music-vibe-detail.tsx 迁移）：
 * - UserBadges: SBT 徽章展示
 * - CVIBBalanceCard: 代币余额
 * - MintBadgeButton: 铸造入口
 * - Spotify 验证方式选择
 */

import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useEmbeddedWallet } from "@privy-io/expo";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import UserBadges from "../../components/UserBadges";
import CVIBBalanceCard from "../../components/CVIBBalanceCard";
import MintBadgeButton from "../../components/MintBadgeButton";
import SpotifyConnector from "../../components/SpotifyConnector";
import SpotifyDataImport from "../../components/SpotifyDataImport";
import SpotifyVerifier, { type VerificationResult } from "../../components/SpotifyVerifier";
import { calculateCVIBFromStats } from "../../lib/consensus/tier-calculator";
import type { StreamingStats } from "../../lib/spotify/streaming-history-parser";
import type { SpotifyTokens } from "../../lib/spotify/spotify-auth";
import { calculateTierFromPlaytime } from "../../lib/spotify/streaming-history-parser";
import { TIER, type TierLevel } from "../../lib/consensus/tier-calculator";
import { saveSpotifyTokens } from "../../lib/spotify/streaming-sync";

// ============================================
// 类型定义
// ============================================

type VerifyMethod = "oauth" | "import" | "reclaim";

interface SpotifyData {
    profile: { display_name: string; email: string } | null;
    topArtists: Array<{ name: string; genres: string[]; popularity: number }>;
    topGenres: string[];
}

// 可选流派列表
const AVAILABLE_GENRES = [
    { id: "pop", name: "Pop", emoji: "🎤" },
    { id: "rock", name: "Rock", emoji: "🎸" },
    { id: "hip-hop", name: "Hip-Hop", emoji: "🎤" },
    { id: "r&b", name: "R&B", emoji: "🎵" },
    { id: "electronic", name: "Electronic", emoji: "🎧" },
];

// ============================================
// Mine 主组件
// ============================================

export default function MineScreen() {
    const wallet = useEmbeddedWallet();

    // 验证状态
    const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>("import");
    const [reclaimResult, setReclaimResult] = useState<VerificationResult | null>(null);
    const [oauthConnected, setOauthConnected] = useState(false);
    const [oauthData, setOauthData] = useState<SpotifyData | null>(null);
    const [importedStats, setImportedStats] = useState<StreamingStats | null>(null);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // 铸造状态
    const [mintSuccess, setMintSuccess] = useState(false);
    const [badgeRefreshKey, setBadgeRefreshKey] = useState(0);

    // CVIB 领取状态
    const [claiming, setClaiming] = useState(false);
    const [cvibClaimed, setCvibClaimed] = useState(false);

    // 判断是否已验证
    const isVerified =
        (verifyMethod === "reclaim" && reclaimResult !== null) ||
        (verifyMethod === "oauth" && oauthConnected && oauthData !== null) ||
        (verifyMethod === "import" && importedStats !== null);

    // 获取当前流派
    const getCurrentGenres = (): string[] => {
        if (verifyMethod === "reclaim" && reclaimResult?.parsedData?.genres) {
            return reclaimResult.parsedData.genres;
        }
        if (verifyMethod === "oauth" && oauthData?.topGenres) {
            return oauthData.topGenres;
        }
        if (verifyMethod === "import" && importedStats) {
            return selectedGenres;
        }
        return [];
    };

    // 获取当前 Tier
    const getCurrentTier = (): TierLevel => {
        if (verifyMethod === "reclaim" && reclaimResult?.suggestedTier) {
            return reclaimResult.suggestedTier;
        }
        if (verifyMethod === "oauth" && oauthData?.topArtists?.[0]?.popularity) {
            const popularity = oauthData.topArtists[0].popularity;
            if (popularity >= 80) return TIER.OG;
            if (popularity >= 50) return TIER.VETERAN;
        }
        if (verifyMethod === "import" && importedStats?.topArtists?.[0]) {
            return calculateTierFromPlaytime(importedStats.topArtists[0].totalHours);
        }
        return TIER.ENTRY;
    };

    // 计算预估 CVIB
    const getEstimatedCVIB = (): number | undefined => {
        if (verifyMethod === "import" && importedStats) {
            const result = calculateCVIBFromStats({
                totalHours: importedStats.totalHours,
                topArtists: importedStats.topArtists,
            });
            return result.totalCVIB;
        }
        return undefined;
    };

    // 处理 CVIB 领取
    const handleClaimCVIB = useCallback(async () => {
        setClaiming(true);
        setTimeout(() => {
            setClaiming(false);
            setCvibClaimed(true);
            setBadgeRefreshKey(prev => prev + 1);
            Alert.alert(
                "MVP 阶段",
                "请联系管理员使用 mint-cvib.js 脚本为你铸造 $CVIB。成功后即可铸造徽章。"
            );
        }, 1000);
    }, []);

    // 复制钱包地址
    const handleCopyAddress = async () => {
        if (wallet.account?.address) {
            await Clipboard.setStringAsync(wallet.account.address);
            Alert.alert("✅ Copied", "Wallet address copied to clipboard");
        }
    };

    // 切换流派选择
    const toggleGenre = (genreId: string) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(g => g !== genreId)
                : [...prev, genreId]
        );
    };

    // 处理验证完成
    const handleReclaimComplete = useCallback((result: VerificationResult) => {
        setReclaimResult(result);
    }, []);

    const handleOAuthConnect = useCallback(async (data: SpotifyData, tokens: SpotifyTokens) => {
        setOauthConnected(true);
        setOauthData(data);

        const userId = wallet.status === "connected" && wallet.account
            ? wallet.account.address
            : undefined;
        if (userId && tokens) {
            try {
                await saveSpotifyTokens(userId, tokens);
            } catch (error) {
                console.warn("保存 Spotify tokens 失败:", error);
            }
        }
    }, [wallet]);

    const handleImportComplete = useCallback((stats: StreamingStats) => {
        setImportedStats(stats);
    }, []);

    const handleMintSuccess = useCallback((txHash: string, mintedGenres: number[]) => {
        setMintSuccess(true);
        setBadgeRefreshKey(prev => prev + 1);
    }, []);

    // 重置
    const handleReset = useCallback(() => {
        setReclaimResult(null);
        setOauthConnected(false);
        setOauthData(null);
        setImportedStats(null);
        setSelectedGenres([]);
        setMintSuccess(false);
    }, []);

    const genres = getCurrentGenres();
    const tier = getCurrentTier();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* 页面标题 */}
            <View style={styles.header}>
                <Text style={styles.title}>⛏️ My Music Assets</Text>
                <Text style={styles.subtitle}>
                    Your Web3 music identity hub
                </Text>
            </View>

            {/* 钱包信息 */}
            <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                    <Text style={styles.walletEmoji}>💎</Text>
                    <Text style={styles.walletTitle}>Wallet</Text>
                </View>
                {wallet.status === "connected" && wallet.account ? (
                    <Pressable onPress={handleCopyAddress} style={styles.addressContainer}>
                        <Text style={styles.addressText} numberOfLines={1}>
                            {wallet.account.address}
                        </Text>
                        <Text style={styles.copyHint}>Tap to copy</Text>
                    </Pressable>
                ) : (
                    <Text style={styles.walletStatus}>Connecting...</Text>
                )}
            </View>

            {/* $CVIB 余额卡片 */}
            <CVIBBalanceCard
                refreshKey={badgeRefreshKey}
                estimatedCVIB={isVerified ? getEstimatedCVIB() : undefined}
                showClaimButton={isVerified && !cvibClaimed}
                claiming={claiming}
                onClaimPress={handleClaimCVIB}
            />

            {/* SBT 徽章展示 */}
            <View style={styles.badgesSection}>
                <UserBadges key={`badges-${badgeRefreshKey}`} />
            </View>

            {/* 铸造成功提示 */}
            {mintSuccess && (
                <View style={styles.successCard}>
                    <Text style={styles.successTitle}>🎉 Congratulations!</Text>
                    <Text style={styles.successText}>
                        Your music badge has been minted! This SBT is forever bound to your soul.
                    </Text>
                    <Pressable onPress={handleReset} style={styles.continueButton}>
                        <Text style={styles.continueButtonText}>Verify more genres</Text>
                    </Pressable>
                </View>
            )}

            {/* 验证方式选择 */}
            {!isVerified && !mintSuccess && (
                <View style={styles.verifySection}>
                    <Text style={styles.verifySectionTitle}>🔐 Verify Your Music</Text>
                    <View style={styles.methodButtons}>
                        <Pressable
                            onPress={() => setVerifyMethod("import")}
                            style={[styles.methodBtn, verifyMethod === "import" && styles.methodBtnActiveImport]}
                        >
                            <Text style={[styles.methodBtnText, verifyMethod === "import" && styles.methodBtnTextActive]}>
                                📊 Import
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setVerifyMethod("oauth")}
                            style={[styles.methodBtn, verifyMethod === "oauth" && styles.methodBtnActive]}
                        >
                            <Text style={[styles.methodBtnText, verifyMethod === "oauth" && styles.methodBtnTextActive]}>
                                🔗 OAuth
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setVerifyMethod("reclaim")}
                            style={[styles.methodBtn, verifyMethod === "reclaim" && styles.methodBtnActiveReclaim]}
                        >
                            <Text style={[styles.methodBtnText, verifyMethod === "reclaim" && styles.methodBtnTextActive]}>
                                🔒 Reclaim
                            </Text>
                        </Pressable>
                    </View>

                    {/* 验证组件 */}
                    <View style={styles.verifyComponent}>
                        {verifyMethod === "oauth" && (
                            <SpotifyConnector
                                onConnect={handleOAuthConnect}
                                onDisconnect={handleReset}
                            />
                        )}
                        {verifyMethod === "import" && (
                            <SpotifyDataImport
                                onImportComplete={handleImportComplete}
                                onError={(err) => console.error("Import error:", err)}
                            />
                        )}
                        {verifyMethod === "reclaim" && (
                            <SpotifyVerifier
                                onVerificationComplete={handleReclaimComplete}
                                onError={(err) => console.error("Reclaim error:", err)}
                            />
                        )}
                    </View>
                </View>
            )}

            {/* 数据导入成功 - 显示流派选择 */}
            {verifyMethod === "import" && importedStats && !mintSuccess && (
                <View style={styles.genreSection}>
                    <Text style={styles.genreSectionTitle}>Select genre badges to mint</Text>
                    <View style={styles.genreButtons}>
                        {AVAILABLE_GENRES.map((genre) => (
                            <Pressable
                                key={genre.id}
                                onPress={() => toggleGenre(genre.id)}
                                style={[
                                    styles.genreBtn,
                                    selectedGenres.includes(genre.id) && styles.genreBtnActive,
                                ]}
                            >
                                <Text style={[
                                    styles.genreBtnText,
                                    selectedGenres.includes(genre.id) && styles.genreBtnTextActive,
                                ]}>
                                    {genre.emoji} {genre.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {selectedGenres.length > 0 && (
                        <MintBadgeButton
                            genres={selectedGenres}
                            suggestedTier={tier}
                            onSuccess={handleMintSuccess}
                            onError={(error) => console.error("Mint failed:", error)}
                        />
                    )}
                </View>
            )}

            {/* OAuth/Reclaim 验证成功后显示铸造按钮 */}
            {isVerified && verifyMethod !== "import" && genres.length > 0 && !mintSuccess && (
                <View style={styles.mintSection}>
                    <View style={styles.detectedGenres}>
                        <Text style={styles.detectedGenresLabel}>Detected genres:</Text>
                        <View style={styles.genreTags}>
                            {genres.slice(0, 5).map((genre, index) => (
                                <View key={index} style={styles.genreTag}>
                                    <Text style={styles.genreTagText}>{genre}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <MintBadgeButton
                        genres={genres}
                        suggestedTier={tier}
                        proof={verifyMethod === "reclaim" ? reclaimResult?.proof ?? undefined : undefined}
                        onSuccess={handleMintSuccess}
                        onError={(error) => console.error("Mint failed:", error)}
                    />

                    <Pressable onPress={handleReset} style={styles.resetButton}>
                        <Text style={styles.resetButtonText}>Re-verify</Text>
                    </Pressable>
                </View>
            )}

            {/* 底部安全区域 */}
            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

// ============================================
// 样式
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#09090b",
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
    },
    subtitle: {
        color: "#71717a",
        fontSize: 14,
    },
    walletCard: {
        backgroundColor: "#18181b",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    walletHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    walletEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    walletTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    addressContainer: {
        backgroundColor: "#27272a",
        borderRadius: 8,
        padding: 12,
    },
    addressText: {
        color: "#8b5cf6",
        fontSize: 12,
        fontFamily: "monospace",
        marginBottom: 4,
    },
    copyHint: {
        color: "#71717a",
        fontSize: 11,
    },
    walletStatus: {
        color: "#71717a",
        fontSize: 14,
    },
    badgesSection: {
        marginBottom: 16,
    },
    successCard: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(34, 197, 94, 0.3)",
    },
    successTitle: {
        color: "#22c55e",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    successText: {
        color: "#d1d5db",
        fontSize: 14,
        lineHeight: 20,
    },
    continueButton: {
        marginTop: 16,
        backgroundColor: "#27272a",
        paddingVertical: 10,
        borderRadius: 8,
    },
    continueButtonText: {
        color: "#a1a1aa",
        textAlign: "center",
        fontSize: 14,
    },
    verifySection: {
        backgroundColor: "#18181b",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    verifySectionTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    methodButtons: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    methodBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#27272a",
        alignItems: "center",
    },
    methodBtnActive: {
        backgroundColor: "#16a34a",
    },
    methodBtnActiveImport: {
        backgroundColor: "#9333ea",
    },
    methodBtnActiveReclaim: {
        backgroundColor: "#8b5cf6",
    },
    methodBtnText: {
        color: "#a1a1aa",
        fontSize: 14,
        fontWeight: "500",
    },
    methodBtnTextActive: {
        color: "#ffffff",
    },
    verifyComponent: {
        marginTop: 8,
    },
    genreSection: {
        backgroundColor: "#18181b",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    genreSectionTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 12,
    },
    genreButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    genreBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#27272a",
    },
    genreBtnActive: {
        backgroundColor: "#9333ea",
    },
    genreBtnText: {
        color: "#a1a1aa",
        fontSize: 14,
    },
    genreBtnTextActive: {
        color: "#ffffff",
    },
    mintSection: {
        marginBottom: 16,
    },
    detectedGenres: {
        backgroundColor: "#18181b",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    detectedGenresLabel: {
        color: "#a1a1aa",
        fontSize: 14,
        marginBottom: 8,
    },
    genreTags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    genreTag: {
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(139, 92, 246, 0.4)",
    },
    genreTagText: {
        color: "#a78bfa",
        fontSize: 14,
        textTransform: "capitalize",
    },
    resetButton: {
        marginTop: 16,
        paddingVertical: 10,
    },
    resetButtonText: {
        color: "#71717a",
        textAlign: "center",
        fontSize: 14,
    },
});
