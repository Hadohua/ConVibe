/**
 * PrivyProviderWrapper.tsx - 平台条件判断 Provider 入口
 * 
 * 根据当前平台自动选择使用 Web SDK 或 Native SDK。
 */

import { Platform, View, Text, ActivityIndicator } from "react-native";
import { getPrivyAppId, getPrivyClientId } from "../../lib/web3/privy-config";

// 动态导入 Provider 组件
import { PrivyProviderWeb } from "./PrivyProviderWeb";
import { PrivyProviderNative } from "./PrivyProviderNative";

interface PrivyProviderWrapperProps {
    children: React.ReactNode;
}

/**
 * 平台条件判断 Provider
 * 
 * 根据 Platform.OS 选择正确的 Privy Provider：
 * - Web: 使用 @privy-io/react-auth
 * - iOS/Android: 使用 @privy-io/expo
 */
export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
    const appId = getPrivyAppId();
    const clientId = getPrivyClientId();

    // 检查配置
    const hasWebConfig = !!appId;
    const hasNativeConfig = !!appId && !!clientId;

    // Web 平台
    if (Platform.OS === "web") {
        if (!hasWebConfig) {
            return <ConfigMissingScreen platform="web" />;
        }
        return <PrivyProviderWeb>{children}</PrivyProviderWeb>;
    }

    // 移动端平台
    if (!hasNativeConfig) {
        return <ConfigMissingScreen platform="native" />;
    }
    return <PrivyProviderNative>{children}</PrivyProviderNative>;
}

/**
 * 配置缺失提示组件
 */
function ConfigMissingScreen({ platform }: { platform: "web" | "native" }) {
    const missingVars = platform === "web"
        ? ["EXPO_PUBLIC_PRIVY_APP_ID"]
        : ["EXPO_PUBLIC_PRIVY_APP_ID", "EXPO_PUBLIC_PRIVY_CLIENT_ID"];

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0f", padding: 32 }}>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
                ⚠️ 配置缺失
            </Text>
            <Text style={{ color: "#9ca3af", textAlign: "center" }}>
                请在 .env 文件中配置 Privy 凭证：{"\n\n"}
                {missingVars.join("\n")}{"\n\n"}
                获取方式：https://dashboard.privy.io
            </Text>
        </View>
    );
}
