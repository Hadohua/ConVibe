/**
 * lib/web3/reclaim-config.ts - Reclaim Protocol 配置文件
 * 
 * Reclaim Protocol 用于生成零知识证明 (zkProof)，
 * 验证用户的 Spotify 数据而不泄露隐私。
 */

/**
 * 获取 Reclaim App ID
 * 
 * 这是在 Reclaim Developer Portal 创建应用时获得的 ID
 * https://dev.reclaimprotocol.org
 */
export const getReclaimAppId = (): string => {
    const appId = process.env.EXPO_PUBLIC_RECLAIM_APP_ID;
    if (!appId) {
        console.warn(
            '⚠️ EXPO_PUBLIC_RECLAIM_APP_ID 未设置！\n' +
            '请在 .env 文件中配置 Reclaim App ID。\n' +
            '获取方式：https://dev.reclaimprotocol.org'
        );
        return '';
    }
    return appId;
};

/**
 * 获取 Reclaim App Secret
 * 
 * 用于验证请求的密钥
 */
export const getReclaimAppSecret = (): string => {
    const secret = process.env.EXPO_PUBLIC_RECLAIM_APP_SECRET;
    if (!secret) {
        console.warn(
            '⚠️ EXPO_PUBLIC_RECLAIM_APP_SECRET 未设置！\n' +
            '请在 .env 文件中配置 Reclaim App Secret。'
        );
        return '';
    }
    return secret;
};

/**
 * 获取 Spotify Provider ID
 * 
 * 这是在 Reclaim Developer Portal 创建的 Spotify Top Artists Provider 的 ID
 * Provider 定义了要验证的具体数据（如 top artist 名称、popularity）
 */
export const getSpotifyProviderId = (): string => {
    const providerId = process.env.EXPO_PUBLIC_RECLAIM_PROVIDER_ID;
    if (!providerId) {
        console.warn(
            '⚠️ EXPO_PUBLIC_RECLAIM_PROVIDER_ID 未设置！\n' +
            '请在 Reclaim Developer Portal 创建 Spotify Provider 并配置。'
        );
        return '';
    }
    return providerId;
};

/**
 * Reclaim 配置对象
 */
export const reclaimConfig = {
    getAppId: getReclaimAppId,
    getAppSecret: getReclaimAppSecret,
    getProviderId: getSpotifyProviderId,
};
