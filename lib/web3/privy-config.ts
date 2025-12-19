/**
 * lib/web3/privy-config.ts - Privy SDK 配置文件
 * 
 * 这个文件封装了 Privy 的所有配置选项。
 * 虽然大部分登录方式在 Privy Dashboard 中配置，
 * 但嵌入式钱包的创建策略需要在代码中指定。
 */

/**
 * Privy 配置接口
 * 定义了 PrivyProvider 接受的配置类型
 */
export interface PrivyConfig {
    // 嵌入式钱包配置
    embeddedWallets: {
        // 钱包创建策略
        // 'users-without-wallets': 仅为没有外部钱包的用户创建（推荐）
        // 'all-users': 为所有用户创建
        // 'off': 不自动创建
        createOnLogin: 'users-without-wallets' | 'all-users' | 'off';
    };
}

/**
 * VibeConsensus 的 Privy 配置
 * 
 * 核心配置说明：
 * - createOnLogin: 'users-without-wallets'
 *   这是实现"无感接入"的关键！
 *   当用户使用 Google 登录后，如果他们没有连接外部钱包（如 MetaMask），
 *   Privy 会在后台静默创建一个嵌入式钱包。
 *   用户完全不需要了解私钥、助记词等概念，就能拥有链上身份。
 */
export const privyConfig: PrivyConfig = {
    embeddedWallets: {
        // 无感创建钱包：用户登录时自动创建，无需任何额外操作
        createOnLogin: 'users-without-wallets',
    },
};

/**
 * 获取环境变量中的 Privy App ID
 * 
 * EXPO_PUBLIC_ 前缀是 Expo 的约定，表示这个变量可以在客户端代码中访问
 * 注意：虽然 App ID 在客户端可见，但这是安全的，因为：
 * 1. App ID 本身不是密钥
 * 2. 真正的认证发生在 Privy 服务器端
 * 
 * 备注：由于 Vercel 构建时环境变量可能未正确嵌入，添加硬编码 fallback
 */

// 硬编码 fallback（仅在环境变量不可用时使用）
const PRIVY_APP_ID_FALLBACK = "cmiw0zjp203uol00chb6zvrzi";

export const getPrivyAppId = (): string => {
    const appId = process.env.EXPO_PUBLIC_PRIVY_APP_ID;

    // 调试日志
    console.log("[getPrivyAppId] env value:", appId);
    console.log("[getPrivyAppId] fallback value:", PRIVY_APP_ID_FALLBACK);

    if (!appId) {
        console.warn(
            '⚠️ EXPO_PUBLIC_PRIVY_APP_ID 未设置，使用 fallback 值\n' +
            '请在 Vercel 环境变量中配置正确的值。'
        );
        return PRIVY_APP_ID_FALLBACK;
    }
    return appId;
};

/**
 * 获取环境变量中的 Privy Client ID
 * 
 * Client ID 用于标识使用此 App 的客户端
 */
export const getPrivyClientId = (): string => {
    const clientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID;
    if (!clientId) {
        console.warn(
            '⚠️ EXPO_PUBLIC_PRIVY_CLIENT_ID 未设置！\n' +
            '请在 .env 文件中配置 Privy Client ID。\n' +
            '获取方式：https://dashboard.privy.io -> App Clients'
        );
        return '';
    }
    return clientId;
};
