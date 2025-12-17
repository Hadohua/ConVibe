/**
 * usePrivyUnified.ts - 统一的 Privy Hooks 抽象层
 * 
 * 根据平台自动选择使用 Web SDK 或 Native SDK 的 hooks。
 * 提供一致的 API，让组件无需关心平台差异。
 */

import { Platform } from "react-native";

// Web SDK hooks
import {
    usePrivy as usePrivyWeb,
    useLogin as useLoginWeb,
    useLogout as useLogoutWeb,
} from "@privy-io/react-auth";

// Native SDK hooks
import {
    usePrivy as usePrivyNative,
    useLoginWithOAuth as useLoginWithOAuthNative,
    useEmbeddedWallet as useEmbeddedWalletNative,
} from "@privy-io/expo";

/**
 * 统一的用户状态 Hook
 * 
 * 返回:
 * - user: 当前登录用户
 * - isReady: SDK 是否初始化完成
 * - authenticated: 用户是否已认证 (仅 Web)
 */
export function usePrivyUnified() {
    if (Platform.OS === "web") {
        // Web SDK
        const { user, ready, authenticated } = usePrivyWeb();
        return {
            user,
            isReady: ready,
            authenticated,
        };
    } else {
        // Native SDK
        const { user, isReady } = usePrivyNative();
        return {
            user,
            isReady,
            authenticated: !!user,
        };
    }
}

/**
 * 统一的 OAuth 登录 Hook
 * 
 * 返回:
 * - login: 触发 Google OAuth 登录的函数
 * - state: 登录状态 { status: 'idle' | 'loading' | 'error' | 'done' }
 */
export function useLoginWithOAuthUnified() {
    if (Platform.OS === "web") {
        // Web SDK - 使用 useLogin hook
        const { login: loginWeb } = useLoginWeb();

        return {
            login: async () => {
                // Web SDK 的 login 会自动弹出登录模态框
                await loginWeb();
            },
            // Web SDK 不提供细粒度状态，返回简化状态
            state: { status: "idle" as const },
        };
    } else {
        // Native SDK
        const { login, state } = useLoginWithOAuthNative();

        return {
            login: async () => {
                await login({ provider: "google" });
            },
            state,
        };
    }
}

/**
 * 统一的登出 Hook
 */
export function useLogoutUnified() {
    if (Platform.OS === "web") {
        const { logout } = useLogoutWeb();
        return { logout };
    } else {
        const { logout } = usePrivyNative();
        return { logout };
    }
}

/**
 * 统一的嵌入式钱包 Hook
 * 
 * 注意：Web SDK 和 Native SDK 的嵌入式钱包 API 差异较大，
 * 这里提供基本的地址获取功能。
 */
export function useEmbeddedWalletUnified() {
    if (Platform.OS === "web") {
        // Web SDK - 从 user 对象中获取嵌入式钱包
        const { user } = usePrivyWeb();
        const embeddedWallet = user?.linkedAccounts?.find(
            (account): account is any =>
                account.type === "wallet" && account.walletClientType === "privy"
        );

        return {
            wallet: embeddedWallet ? {
                status: "connected" as const,
                address: embeddedWallet.address as string,
            } : {
                status: "not-created" as const,
                address: undefined as undefined,
            },
        };
    } else {
        // Native SDK
        const wallet = useEmbeddedWalletNative();
        return { wallet };
    }
}

/**
 * 获取钱包地址的便捷函数
 */
export function useWalletAddress(): string | undefined {
    const { wallet } = useEmbeddedWalletUnified();

    if (Platform.OS === "web") {
        // Web SDK - wallet 是我们定义的结构
        if ('address' in wallet && wallet.address) {
            return wallet.address;
        }
        return undefined;
    } else {
        // Native SDK wallet 有不同的结构
        const nativeWallet = wallet as any;
        if (nativeWallet.status === "connected" && nativeWallet.account?.address) {
            return nativeWallet.account.address;
        }
        return undefined;
    }
}
