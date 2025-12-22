/* Metro 配置文件
 * Metro 是 React Native 的 JavaScript 打包工具
 * 
 * 这个配置做了两件重要的事：
 * 1. NativeWind 配置 - 处理 CSS 文件转换
 * 2. Privy 兼容性配置 - 处理特殊包的导出解析
 */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

/**
 * Privy 依赖的 Package Exports 解析器
 * 
 * 为什么需要这个？
 * 某些 npm 包使用了 Node.js 的 "exports" 字段来定义模块解析规则，
 * 但 Metro bundler 和某些依赖之间存在兼容性问题。
 * 这个函数逐个处理这些特殊情况：
 * 
 * - isows: viem 的依赖，package exports 不兼容
 * - zustand: 状态管理库，v4 版本 exports 不兼容
 * - jose: JWT 库，需要使用 browser 版本
 * - @privy-io/*: Privy 包需要启用 package exports
 */
const resolveRequestWithPackageExports = (context, moduleName, platform) => {
    // isows (viem 的依赖) - package exports 不兼容，需要禁用
    if (moduleName === "isows") {
        const ctx = {
            ...context,
            unstable_enablePackageExports: false,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // zustand v4 - package exports 不兼容，需要禁用
    if (moduleName.startsWith("zustand")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: false,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // jose (JWT 库) - 需要使用 browser 版本避免 crypto 模块问题
    if (moduleName === "jose") {
        const ctx = {
            ...context,
            unstable_conditionNames: ["browser"],
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // @privy-io/* 包 - 需要启用 package exports
    // (React Native 0.79+ 默认启用，这里为了兼容旧版本)
    if (moduleName.startsWith("@privy-io/")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: true,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // libphonenumber-js - Privy 的依赖，必须启用 package exports
    // 否则会出现 "Cannot read properties of undefined (reading 'v1')" 错误
    if (moduleName.startsWith("libphonenumber-js")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: true,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // uuid - Privy SDK 依赖，使用 browser 版本
    // wrapper.mjs 在 Node ESM 模式下有问题，使用 browser 版本绕过
    if (moduleName === "uuid" || moduleName.startsWith("uuid/")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: true,
            unstable_conditionNames: ["browser", "import", "require"],
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // @reclaimprotocol/reactnative-sdk - Web 平台使用 shim
    if (moduleName === "@reclaimprotocol/reactnative-sdk" && platform === "web") {
        return {
            filePath: require.resolve("./lib/reclaim-web-shim.ts"),
            type: "sourceFile",
        };
    }

    // expo-application - Web 平台使用 shim (解决 bundleId 错误)
    if (moduleName === "expo-application" && platform === "web") {
        return {
            filePath: require.resolve("./lib/expo-application-web-shim.ts"),
            type: "sourceFile",
        };
    }

    // expo-secure-store - Web 平台使用 localStorage shim (Privy 认证)
    if (moduleName === "expo-secure-store" && platform === "web") {
        return {
            filePath: require.resolve("./lib/expo-secure-store-web-shim.ts"),
            type: "sourceFile",
        };
    }

    // 其他包使用默认解析
    return context.resolveRequest(context, moduleName, platform);
};

// 应用自定义解析器
config.resolver.resolveRequest = resolveRequestWithPackageExports;

// 应用 NativeWind 配置（处理 CSS 文件）
// input 参数指定全局 CSS 文件的位置
module.exports = withNativeWind(config, { input: "./global.css" });
