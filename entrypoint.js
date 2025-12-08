/**
 * entrypoint.js - 应用入口文件
 * 
 * 这个文件是整个应用的真正入口点。
 * Polyfills 必须在所有其他代码之前加载！
 * 
 * 为什么需要 Polyfills？
 * 区块链加密算法（用于钱包签名、地址生成等）依赖于：
 * 1. 随机数生成器 (crypto.getRandomValues) - 用于生成私钥
 * 2. 文本编码器 (TextEncoder/TextDecoder) - 用于消息编码
 * 3. ethers.js 兼容层 - 用于以太坊相关操作
 * 
 * React Native 默认没有这些浏览器 API，所以需要 polyfill 补丁。
 */

// 0. Buffer polyfill - viem 需要 Buffer 支持
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// 1. 文本编码 polyfill - 提供 TextEncoder 和 TextDecoder
// 这是最基础的，必须第一个加载
import 'fast-text-encoding';

// 2. 随机数生成器 polyfill - 提供 crypto.getRandomValues
// 这对于生成安全的密钥对至关重要
import 'react-native-get-random-values';

// 3. ethers.js 兼容层 - 提供以太坊操作所需的底层 API
import '@ethersproject/shims';

// 4. 最后才加载 Expo Router 入口
// 此时所有 Web3 相关的 API 都已就绪
import 'expo-router/entry';
