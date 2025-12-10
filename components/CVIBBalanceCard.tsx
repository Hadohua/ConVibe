/**
 * components/CVIBBalanceCard.tsx - $CVIB 余额显示组件
 * 
 * 功能：
 * - 显示用户 $CVIB 余额
 * - 显示可铸造的最高 Tier
 * - 显示各 Tier 所需 $CVIB 成本
 */

import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { usePrivy, useEmbeddedWallet } from "@privy-io/expo";
import { formatEther } from "viem";
import { publicClient, VIBE_TOKEN_ADDRESS } from "../lib/web3/client";
import { VibeTokenAbi } from "../lib/web3/abi";
import {
    TIER,
    CVIB_TIER_COST,
    TIER_INFO,
    getMaxTierForCVIB,
    type TierLevel,
} from "../lib/consensus/tier-calculator";

// ============================================
// 类型定义
// ============================================

interface CVIBBalanceCardProps {
    /** 紧凑模式 (只显示余额) */
    compact?: boolean;
    /** 刷新触发器 */
    refreshKey?: number;
    /** 预估可获得的 $CVIB (验证后显示) */
    estimatedCVIB?: number;
    /** 显示领取按钮 */
    showClaimButton?: boolean;
    /** 领取中状态 */
    claiming?: boolean;
    /** 领取按钮点击回调 */
    onClaimPress?: () => void;
}

// ============================================
// CVIBBalanceCard 组件
// ============================================

export default function CVIBBalanceCard({
    compact = false,
    refreshKey = 0,
    estimatedCVIB,
    showClaimButton = false,
    claiming = false,
    onClaimPress,
}: CVIBBalanceCardProps) {
    const { user } = usePrivy();
    const wallet = useEmbeddedWallet();

    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 获取余额
    const fetchBalance = useCallback(async () => {
        if (!wallet.account?.address) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const rawBalance = await publicClient.readContract({
                address: VIBE_TOKEN_ADDRESS,
                abi: VibeTokenAbi,
                functionName: "balanceOf",
                args: [wallet.account.address as `0x${string}`],
            }) as bigint;

            setBalance(formatEther(rawBalance));
        } catch (err) {
            console.error("获取 $CVIB 余额失败:", err);
            setError("获取余额失败");
            setBalance("0");
        } finally {
            setLoading(false);
        }
    }, [wallet.account?.address]);

    // 初始加载和刷新
    useEffect(() => {
        fetchBalance();
    }, [fetchBalance, refreshKey]);

    // 解析余额数值
    const balanceNum = parseFloat(balance || "0");
    const maxTier = getMaxTierForCVIB(balanceNum);

    // 钱包未连接
    if (!wallet.account?.address) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.tokenIcon}>💎</Text>
                    <Text style={styles.title}>$CVB 余额</Text>
                </View>
                <Text style={styles.connectHint}>连接钱包后查看余额</Text>
            </View>
        );
    }

    // 加载中
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.tokenIcon}>💎</Text>
                    <Text style={styles.title}>$CVB 余额</Text>
                </View>
                <ActivityIndicator size="small" color="#a855f7" />
            </View>
        );
    }

    // 紧凑模式
    if (compact) {
        return (
            <Pressable onPress={fetchBalance} style={styles.compactContainer}>
                <Text style={styles.tokenIcon}>💎</Text>
                <Text style={styles.compactBalance}>{balanceNum.toFixed(0)}</Text>
                <Text style={styles.compactLabel}>CVB</Text>
            </Pressable>
        );
    }

    // 完整模式
    return (
        <View style={styles.container}>
            {/* 头部 */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.tokenIcon}>💎</Text>
                    <Text style={styles.title}>$CVB 余额</Text>
                </View>
                <Pressable onPress={fetchBalance} style={styles.refreshBtn}>
                    <Text style={styles.refreshText}>刷新</Text>
                </Pressable>
            </View>

            {/* 余额显示 */}
            <View style={styles.balanceRow}>
                <Text style={styles.balanceValue}>{balanceNum.toFixed(2)}</Text>
                <Text style={styles.balanceUnit}>CVB</Text>
            </View>

            {/* 可铸造等级 */}
            {maxTier > 0 ? (
                <View style={[styles.tierBadge, { backgroundColor: TIER_INFO[maxTier as TierLevel].glowColor }]}>
                    <Text style={styles.tierEmoji}>{TIER_INFO[maxTier as TierLevel].emoji}</Text>
                    <Text style={styles.tierText}>
                        可铸造 <Text style={{ color: TIER_INFO[maxTier as TierLevel].color, fontWeight: "600" }}>
                            {TIER_INFO[maxTier as TierLevel].name}
                        </Text> 级徽章
                    </Text>
                </View>
            ) : (
                <View style={styles.insufficientBadge}>
                    <Text style={styles.insufficientText}>
                        💡 需要至少 {CVIB_TIER_COST[TIER.ENTRY]} CVB 才能铸造徽章
                    </Text>
                </View>
            )}

            {/* 预估可获得 */}
            {estimatedCVIB !== undefined && estimatedCVIB > 0 && (
                <View style={styles.estimatedRow}>
                    <Text style={styles.estimatedLabel}>✨ 验证后可获得</Text>
                    <Text style={styles.estimatedValue}>+{estimatedCVIB} CVB</Text>
                </View>
            )}

            {/* 领取按钮 */}
            {showClaimButton && estimatedCVIB !== undefined && estimatedCVIB > 0 && (
                <Pressable
                    style={[styles.claimButton, claiming && styles.claimButtonDisabled]}
                    onPress={onClaimPress}
                    disabled={claiming}
                >
                    {claiming ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.claimButtonText}>
                            💎 领取 {estimatedCVIB} CVB
                        </Text>
                    )}
                </Pressable>
            )}

            {/* Tier 成本表 */}
            <View style={styles.costTable}>
                <Text style={styles.costTableTitle}>铸造成本</Text>
                <View style={styles.costRow}>
                    <View style={styles.costItem}>
                        <Text style={styles.costEmoji}>{TIER_INFO[TIER.ENTRY].emoji}</Text>
                        <Text style={styles.costLabel}>{TIER_INFO[TIER.ENTRY].name}</Text>
                        <Text style={styles.costValue}>{CVIB_TIER_COST[TIER.ENTRY]}</Text>
                    </View>
                    <View style={styles.costItem}>
                        <Text style={styles.costEmoji}>{TIER_INFO[TIER.VETERAN].emoji}</Text>
                        <Text style={styles.costLabel}>{TIER_INFO[TIER.VETERAN].name}</Text>
                        <Text style={styles.costValue}>{CVIB_TIER_COST[TIER.VETERAN]}</Text>
                    </View>
                    <View style={styles.costItem}>
                        <Text style={styles.costEmoji}>{TIER_INFO[TIER.OG].emoji}</Text>
                        <Text style={styles.costLabel}>{TIER_INFO[TIER.OG].name}</Text>
                        <Text style={styles.costValue}>{CVIB_TIER_COST[TIER.OG]}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

// ============================================
// 样式
// ============================================

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#18181b",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    tokenIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    title: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    refreshBtn: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: "#27272a",
        borderRadius: 8,
    },
    refreshText: {
        color: "#a1a1aa",
        fontSize: 12,
    },
    connectHint: {
        color: "#71717a",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 8,
    },
    balanceRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 12,
    },
    balanceValue: {
        color: "#a855f7",
        fontSize: 36,
        fontWeight: "700",
    },
    balanceUnit: {
        color: "#a1a1aa",
        fontSize: 16,
        marginLeft: 8,
    },
    tierBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    tierEmoji: {
        fontSize: 16,
        marginRight: 8,
    },
    tierText: {
        color: "#d4d4d8",
        fontSize: 14,
    },
    insufficientBadge: {
        backgroundColor: "rgba(250, 204, 21, 0.1)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    insufficientText: {
        color: "#facc15",
        fontSize: 13,
    },
    estimatedRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    estimatedLabel: {
        color: "#22c55e",
        fontSize: 13,
    },
    estimatedValue: {
        color: "#22c55e",
        fontSize: 14,
        fontWeight: "600",
    },
    costTable: {
        backgroundColor: "#09090b",
        borderRadius: 8,
        padding: 12,
    },
    costTableTitle: {
        color: "#71717a",
        fontSize: 12,
        marginBottom: 8,
    },
    costRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    costItem: {
        alignItems: "center",
        flex: 1,
    },
    costEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    costLabel: {
        color: "#a1a1aa",
        fontSize: 12,
        marginBottom: 2,
    },
    costValue: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    // 紧凑模式样式
    compactContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#27272a",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    compactBalance: {
        color: "#a855f7",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 4,
    },
    compactLabel: {
        color: "#a1a1aa",
        fontSize: 12,
        marginLeft: 4,
    },
    // 领取按钮样式
    claimButton: {
        backgroundColor: "#22c55e",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 12,
    },
    claimButtonDisabled: {
        opacity: 0.6,
    },
    claimButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
