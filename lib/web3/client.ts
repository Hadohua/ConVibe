/**
 * lib/web3/client.ts - Viem Web3 客户端配置
 * 
 * 连接到 Base Sepolia 测试网
 */

import { createPublicClient, createWalletClient, http, custom } from "viem";
import { baseSepolia } from "viem/chains";

// ============================================
// 常量
// ============================================

/** 合约地址 - V2 版本 (支持 OAuth/Import 铸造) */
export const MUSIC_CONSENSUS_SBT_ADDRESS = "0x1184da97ef82dac78196b23182c82fe6acca82e3" as const;

/** Base Sepolia RPC */
export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

/** Base Sepolia 水龙头 */
export const FAUCET_URL = "https://app.optimism.io/faucet";

// ============================================
// Public Client (只读)
// ============================================

/**
 * 公共客户端 - 用于读取链上数据
 */
export const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_SEPOLIA_RPC),
});

// ============================================
// Wallet Client (需要 Provider)
// ============================================

/**
 * 创建钱包客户端
 * 
 * @param provider - EIP-1193 provider (如 Privy embedded wallet)
 */
export function createViemWalletClient(provider: any) {
    return createWalletClient({
        chain: baseSepolia,
        transport: custom(provider),
    });
}

// ============================================
// 链信息
// ============================================

export const chainInfo = {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: BASE_SEPOLIA_RPC,
    blockExplorer: "https://sepolia.basescan.org",
    faucet: FAUCET_URL,
};
