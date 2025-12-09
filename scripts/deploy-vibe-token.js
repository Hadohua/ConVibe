/**
 * Deploy VibeToken ($CVIB) to Base Sepolia
 * 
 * Usage:
 *   source .env && PRIVATE_KEY=$PRIVATE_KEY npx hardhat run scripts/deploy-vibe-token.js --network baseSepolia
 */

import hre from "hardhat";
import { createWalletClient, createPublicClient, http, formatEther, encodeAbiParameters, parseAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

async function main() {
    console.log("🚀 Deploying VibeToken ($CVIB) to Base Sepolia...\n");

    // 读取私钥
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY not set");
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

    console.log("Deployer address:", account.address);
    const balance = await publicClient.getBalance({ address: account.address });
    console.log("Deployer balance:", formatEther(balance), "ETH\n");

    // 合约参数
    const initialOwner = account.address;

    console.log("📋 Deployment Parameters:");
    console.log("  - Initial Owner:", initialOwner);
    console.log("");

    // 读取编译后的合约
    const artifact = await hre.artifacts.readArtifact("VibeToken");

    // ABI 编码构造函数参数
    const encodedArgs = encodeAbiParameters(
        parseAbiParameters("address"),
        [initialOwner]
    );

    const deployData = artifact.bytecode + encodedArgs.slice(2);

    console.log("📤 Sending deployment transaction...");

    // 部署合约
    const hash = await walletClient.sendTransaction({
        data: deployData,
        gas: 2000000n,
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...\n");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log("✅ VibeToken deployed successfully!");
        console.log("📍 Contract Address:", receipt.contractAddress);
        console.log("");
        console.log("🔗 BaseScan:", `https://sepolia.basescan.org/address/${receipt.contractAddress}`);
        console.log("");
        console.log("📝 Next steps:");
        console.log("   1. Copy contract address to .env as VIBE_TOKEN_ADDRESS");
        console.log("   2. Update VIBE_TOKEN_ADDRESS in lib/web3/client.ts");
        console.log("   3. Deploy MusicConsensusSBTV4 with this token address");
        console.log("");
        console.log("🔑 To mint tokens for testing:");
        console.log(`   await vibeToken.mint("${account.address}", ethers.parseEther("1000"))`);
    } else {
        console.log("❌ Deployment failed!");
        console.log("Receipt:", receipt);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
