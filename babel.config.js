module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            // Babel 预设的顺序很重要！
            // 1. 首先是 Expo 的预设，处理 React Native 的基础转换
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            // 2. NativeWind 的预设，使 className 属性能正确转换为 React Native 样式
            "nativewind/babel",
        ],
        plugins: [
            // 3. Reanimated 插件 - 必须放在最后！
            // 用于驱动 NativeWind 动画和 Passkeys 的 worklets
            "react-native-reanimated/plugin",
        ],
    };
};
