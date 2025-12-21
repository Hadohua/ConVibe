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
            // 处理 import.meta 语法 - 在非 ES Module 环境下会报错
            // 这个插件将 import.meta.env 替换为 process.env
            function transformImportMeta({ types: t }) {
                return {
                    visitor: {
                        MetaProperty(path) {
                            // import.meta.env.* -> process.env.*
                            if (
                                path.node.meta.name === "import" &&
                                path.node.property.name === "meta"
                            ) {
                                // Check if parent is MemberExpression (import.meta.env)
                                if (
                                    path.parentPath.isMemberExpression() &&
                                    path.parentPath.node.property.name === "env"
                                ) {
                                    path.parentPath.replaceWith(
                                        t.memberExpression(
                                            t.identifier("process"),
                                            t.identifier("env")
                                        )
                                    );
                                } else {
                                    // Replace import.meta with empty object
                                    path.replaceWith(t.objectExpression([]));
                                }
                            }
                        },
                    },
                };
            },
            // 3. Reanimated 插件 - 必须放在最后！
            // 用于驱动 NativeWind 动画和 Passkeys 的 worklets
            "react-native-reanimated/plugin",
        ],
    };
};
