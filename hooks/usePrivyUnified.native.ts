/**
 * usePrivyUnified.native.ts - Native 平台专用 Privy Hooks
 * 
 * 使用 @privy-io/expo SDK 的 hooks。
 * Metro bundler 会根据 .native.ts 后缀自动在 iOS/Android 平台使用此文件。
 */

import {
    usePrivy,
    useLoginWithOAuth,
    useEmbeddedWallet,
} from "@privy-io/expo";

/**
 * 统一的用户状态 Hook - Native 版
 */
export function usePrivyUnified() {
    const { user, isReady } = usePrivy();
    return {
        user,
        isReady,
        authenticated: !!user,
    };
}

/**
 * 统一的 OAuth 登录 Hook - Native 版
 */
export function useLoginWithOAuthUnified() {
    const { login, state } = useLoginWithOAuth();

    return {
        login: async () => {
            await login({ provider: "google" });
        },
        state,
    };
}

/**
 * 统一的登出 Hook - Native 版
 */
export function useLogoutUnified() {
    const { logout } = usePrivy();
    return { logout };
}

/**
 * 统一的嵌入式钱包 Hook - Native 版
 */
export function useEmbeddedWalletUnified() {
    const wallet = useEmbeddedWallet();
    return { wallet };
}

/**
 * 获取钱包地址的便捷函数 - Native 版
 */
export function useWalletAddress(): string | undefined {
    const { wallet } = useEmbeddedWalletUnified();

    const nativeWallet = wallet as any;
    if (nativeWallet.status === "connected" && nativeWallet.account?.address) {
        return nativeWallet.account.address;
    }
    return undefined;
}
