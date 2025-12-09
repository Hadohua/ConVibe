/**
 * scripts/mint-cvib.js - MVP $CVIB 铸造脚本
 * 
 * 用于在 MVP 阶段手动为用户铸造 $CVIB 代币
 * 
 * Usage:
 *   source .env && PRIVATE_KEY=$PRIVATE_KEY USER_ADDRESS=0x... AMOUNT=1000 npx hardhat run scripts/mint-cvib.js --network baseSepolia
 */

import hre from "hardhat";
import { createWalletClient, createPublicClient, http, formatEther, parseEther, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// VibeToken 合约地址
const VIBE_TOKEN_ADDRESS = "0x659b53fdf2b7a0ab4cc71d39b61b02c41245d074";

// VibeToken ABI (简化版)
const VibeTokenAbi = [
    {
        name: "mint",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [],
    },
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "owner",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
    },
];

async function main() {
    console.log("💎 $CVIB Minting Script\n");

    // 读取环境变量
    const privateKey = process.env.PRIVATE_KEY;
    const userAddress = process.env.USER_ADDRESS;
    const amount = process.env.AMOUNT || "1000"; // 默认 1000 CVIB

    if (!privateKey) {
        throw new Error("PRIVATE_KEY not set");
    }
    if (!userAddress) {
        console.log("Usage: USER_ADDRESS=0x... AMOUNT=1000 npx hardhat run scripts/mint-cvib.js --network baseSepolia");
        throw new Error("USER_ADDRESS not set");
    }

    // 创建账户和客户端
    const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);

    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http("https://sepolia.base.org"),
    });

    const walletClient = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http("https://sepolia.base.org"),
    });

    console.log("🔑 Minter address:", account.address);
    console.log("📍 VibeToken:", VIBE_TOKEN_ADDRESS);
    console.log("👤 Recipient:", userAddress);
    console.log("💰 Amount:", amount, "CVIB\n");

    // 检查调用者是否是 owner
    const owner = await publicClient.readContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: VibeTokenAbi,
        functionName: "owner",
    });

    console.log("📋 Contract owner:", owner);

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
        console.log("⚠️  Warning: You are not the contract owner. Make sure you are an authorized minter.");
    }

    // 获取用户当前余额
    const beforeBalance = await publicClient.readContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: VibeTokenAbi,
        functionName: "balanceOf",
        args: [userAddress],
    });

    console.log("📊 Before balance:", formatEther(beforeBalance), "CVIB");

    // 编码铸造调用
    const amountWei = parseEther(amount);
    const data = encodeFunctionData({
        abi: VibeTokenAbi,
        functionName: "mint",
        args: [userAddress, amountWei],
    });

    console.log("\n📤 Sending mint transaction...");

    // 发送交易
    const hash = await walletClient.sendTransaction({
        to: VIBE_TOKEN_ADDRESS,
        data: data,
        gas: 100000n,
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...\n");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        // 获取新余额
        const afterBalance = await publicClient.readContract({
            address: VIBE_TOKEN_ADDRESS,
            abi: VibeTokenAbi,
            functionName: "balanceOf",
            args: [userAddress],
        });

        console.log("✅ Mint successful!");
        console.log("📊 After balance:", formatEther(afterBalance), "CVIB");
        console.log("🔗 BaseScan:", `https://sepolia.basescan.org/tx/${hash}`);
    } else {
        console.log("❌ Mint failed!");
        console.log("Receipt:", receipt);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
