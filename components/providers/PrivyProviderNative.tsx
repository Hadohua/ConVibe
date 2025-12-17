/**
 * PrivyProviderNative.tsx - 移动端专用 Privy Provider
 * 
 * 使用 @privy-io/expo 为 React Native 移动端提供 Privy 认证服务。
 */

import { PrivyProvider } from "@privy-io/expo";
import { getPrivyAppId, getPrivyClientId } from "../../lib/web3/privy-config";

interface PrivyProviderNativeProps {
    children: React.ReactNode;
}

/**
 * 移动端专用 Privy Provider
 * 
 * 使用 @privy-io/expo 包，适用于 iOS 和 Android 平台。
 * appId 和 clientId 从环境变量中读取。
 */
export function PrivyProviderNative({ children }: PrivyProviderNativeProps) {
    const appId = getPrivyAppId();
    const clientId = getPrivyClientId();

    if (!appId || !clientId) {
        return <>{children}</>;
    }

    return (
        <PrivyProvider appId={appId} clientId={clientId}>
            {children}
        </PrivyProvider>
    );
}
