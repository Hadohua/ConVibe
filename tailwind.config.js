/** @type {import('tailwindcss').Config} */
module.exports = {
  // 告诉 Tailwind 扫描哪些文件中的样式类
  // NativeWind 需要知道在哪里查找 className 的使用
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  // 预设使用 NativeWind 的样式转换器
  // 这是让 Tailwind 样式在 React Native 中生效的关键
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // 自定义颜色 - VibeConsensus 品牌色
      colors: {
        // VibeConsensus 核心品牌色
        'vibe-black': '#09090b',      // 深色背景
        'vibe-green': '#1db954',      // Spotify 强调色
        'vibe-purple': '#8b5cf6',     // Web3 强调色
        'vibe-gold': '#fbbf24',       // SBT 尊贵色

        // 主色调 - 充满活力的紫色系
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        // 深色背景系列
        dark: {
          50: '#18181b',
          100: '#1c1c1f',
          200: '#27272a',
          300: '#3f3f46',
          400: '#52525b',
        },
      },
    },
  },
  plugins: [],
};
