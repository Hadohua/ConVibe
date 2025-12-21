/**
 * PrivyProviderWrapper.web.tsx - Web 平台专用 Provider Wrapper
 * 
 * 使用 @privy-io/react-auth。
 */

import { View, Text } from "react-native";
import { getPrivyAppId } from "../../lib/web3/privy-config";
import { PrivyProviderWeb } from "./PrivyProviderWeb";

interface PrivyProviderWrapperProps {
    children: React.ReactNode;
}

/**
 * Web 平台 Provider Wrapper
 */
export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
    const appId = getPrivyAppId();

    if (!appId) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0f", padding: 32 }}>
                <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
                    ⚠️ 配置缺失
                </Text>
                <Text style={{ color: "#9ca3af", textAlign: "center" }}>
                    请在 .env 文件中配置 Privy 凭证：{"\n\n"}
                    EXPO_PUBLIC_PRIVY_APP_ID{"\n\n"}
                    获取方式：https://dashboard.privy.io
                </Text>
            </View>
        );
    }

    return <PrivyProviderWeb>{children}</PrivyProviderWeb>;
}
