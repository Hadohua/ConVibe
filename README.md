# 🎵 ConVibe - Web3 泛文化共识超级 DApp

<div align="center">

![ConVibe Banner](https://img.shields.io/badge/ConVibe-Web3%20Social-8b5cf6?style=for-the-badge&logo=ethereum)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react)
![Base](https://img.shields.io/badge/Base-Sepolia-0052FF?style=for-the-badge&logo=coinbase)

**基于零知识证明的身份验证 + 灵魂绑定代币的 Web3 社交应用**

[功能介绍](#-功能特性) · [快速开始](#-快速开始) · [技术架构](#-技术架构) · [经济模型](#-cvib-经济模型) · [路线图](#-未来路线图)

</div>

---

## 🌟 项目简介

ConVibe 是一个创新的 Web3 社交 DApp，通过 **零知识证明 (zkTLS)** 验证用户的链下文化消费数据（如 Spotify 音乐偏好），并铸造为链上 **灵魂绑定代币 (SBT)**，构建可信的用户"灵魂画像"。

### 💡 核心理念

> **你的品味即资产** - 你的音乐品味，是你灵魂的一部分。我们让它上链，成为你不可转让的数字身份。

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🔐 **无感登录** | Google 社交登录，自动创建嵌入式钱包 |
| 🎵 **三重验证** | OAuth / 数据导入 / Reclaim zkTLS 零知识证明 |
| 💎 **$CVB 代币** | 根据听歌时长获得代币，销毁代币铸造徽章 |
| 🏆 **分层 SBT 徽章** | 入门 / 资深 / OG 三级徽章体系 |
| 📊 **听歌统计** | 导入 Spotify 数据包，查看详细统计 |
| 📋 **钱包管理** | 一键复制钱包地址，查看余额 |
| 🔥 **共识社区** | 基于徽章的门控内容和投票系统 |

---

## 💎 $CVB 经济模型

ConVibe 引入 **$CVB (Convibe Token)** 作为平台的核心代币：

### 获取 $CVB

- 📊 验证并导入 Spotify 数据
- ⏱️ 每小时听歌时长 = 10 CVB
- 🎯 深度艺人奖励 (前10艺人额外加成)

### 铸造徽章成本

| 等级 | 名称 | 所需 $CVB |
|------|------|-----------|
| 🌱 Tier 1 | 入门 | 100 CVB |
| ⭐ Tier 2 | 资深 | 500 CVB |
| 👑 Tier 3 | OG | 1000 CVB |

### 代币流转

```
验证 Spotify → 计算听歌时长 → 获得 $CVB → 销毁 $CVB → 铸造 SBT 徽章
```

---

## 🛠️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (Mobile)                         │
├─────────────────────────────────────────────────────────────┤
│  Expo SDK 54  │  React Native 0.81  │  NativeWind/Tailwind  │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                        身份 & 钱包                           │
├─────────────────────────────────────────────────────────────┤
│           Privy (社交登录 + 嵌入式钱包)                       │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                        zkTLS 验证层                          │
├─────────────────────────────────────────────────────────────┤
│      Reclaim Protocol (零知识证明验证 Spotify 数据)           │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                        区块链 (Base Sepolia)                 │
├─────────────────────────────────────────────────────────────┤
│  VibeToken ($CVB)   │  MusicConsensusSBT V4  │   Viem          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 前置条件

- Node.js 18+
- npm 或 yarn
- Expo Go App (iOS/Android)

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/Hadohua/ConVibe.git
cd ConVibe

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API Keys

# 4. 启动开发服务器
npx expo start
```

### 环境变量配置

创建 `.env` 文件并填入以下内容：

```env
# Privy (https://dashboard.privy.io)
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
EXPO_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id

# Reclaim Protocol (https://dev.reclaimprotocol.org)
EXPO_PUBLIC_RECLAIM_APP_ID=your_reclaim_app_id
EXPO_PUBLIC_RECLAIM_APP_SECRET=your_reclaim_app_secret
EXPO_PUBLIC_RECLAIM_PROVIDER_ID=your_reclaim_provider_id
```

---

## 🔗 智能合约

已部署在 **Base Sepolia** 测试网：

| 合约 | 地址 | 功能 |
|------|------|------|
| **VibeToken ($CVB)** | `0x659b53fdf2b7a0ab4cc71d39b61b02c41245d074` | ERC-20 代币 |
| **MusicConsensusSBT V4** | `0x25e3af27cc14d260f0e7199a1a06802d81e0b75f` | SBT 徽章 + $CVB 铸造 |

### 合约功能

**VibeToken.sol**
- `mint(address, amount)` - 铸造 $CVB (授权地址)
- `burn(amount)` - 销毁 $CVB
- `balanceOf(address)` - 查询余额

**MusicConsensusSBTV4.sol**
- `mintWithCVIB(genreId, tier)` - 销毁 $CVB 铸造徽章
- `mintWithProof(proof, genreId, tier)` - 链上验证铸造
- `getUserBadges(address)` - 获取用户徽章
- `getBadgeInfo(address, genreId)` - 获取徽章详情

---

## 📂 项目结构

```
ConVibe/
├── app/                    # Expo Router 页面
│   ├── (tabs)/             # Tab 导航页面
│   │   ├── home.tsx        # 主页
│   │   └── profile.tsx     # 个人资料
│   ├── music-vibe-detail.tsx  # 音乐 Vibe 详情页
│   └── _layout.tsx         # 根布局
├── components/             # React 组件
│   ├── CVIBBalanceCard.tsx # $CVB 余额显示
│   ├── MintBadgeButton.tsx # 铸造徽章按钮
│   ├── SpotifyStats.tsx    # 统计展示
│   ├── SpotifyConnector.tsx # OAuth 连接
│   └── UserBadges.tsx      # 用户徽章展示
├── contracts/              # Solidity 智能合约
│   ├── VibeToken.sol       # $CVIB 代币
│   └── MusicConsensusSBTV4.sol  # SBT 徽章 V4
├── hooks/                  # React Hooks
│   └── useMintSBT.ts       # SBT 铸造逻辑
├── lib/                    # 工具库
│   ├── web3/               # 区块链相关
│   ├── spotify/            # Spotify 数据解析
│   ├── api/                # API 模块 ($CVB 领取等)
│   └── consensus/          # $CVB 计算逻辑
└── scripts/                # 部署脚本
    ├── mint-cvib.js        # 手动发放 $CVB
    ├── deploy-sbt-v4.js    # 部署 V4 合约
    └── deploy-convibe-token.js  # 部署代币合约
```

---

## 🗺️ 未来路线图

| 阶段 | 功能 | 状态 |
|------|------|------|
| **Phase 1** | Spotify 音乐验证 + SBT 铸造 | ✅ 已完成 |
| **Phase 2** | $CVIB 经济模型 | ✅ 已完成 |
| **Phase 3** | 泛文化扩展 (Netflix, Steam, Kindle) | 🔜 规划中 |
| **Phase 4** | 去中心化存储 (IPFS/Arweave) | 🔜 规划中 |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License © 2024 ConVibe

---

<div align="center">

**Made with ❤️ by ConVibe Team**

</div>
