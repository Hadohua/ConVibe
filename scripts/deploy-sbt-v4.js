/**
 * Deploy MusicConsensusSBTV4 with $CVIB integration to Base Sepolia
 * 
 * Prerequisites:
 *   - VibeToken ($CVIB) must be deployed first
 *   - Set VIBE_TOKEN_ADDRESS in .env
 * 
 * Usage:
 *   source .env && PRIVATE_KEY=$PRIVATE_KEY VIBE_TOKEN_ADDRESS=$VIBE_TOKEN_ADDRESS npx hardhat run scripts/deploy-sbt-v4.js --network baseSepolia
 */

import hre from "hardhat";
import { createWalletClient, createPublicClient, http, formatEther, encodeAbiParameters, parseAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

async function main() {
    console.log("🚀 Deploying MusicConsensusSBTV4 to Base Sepolia...\n");

    // 读取环境变量
    const privateKey = process.env.PRIVATE_KEY;
    const vibeTokenAddress = process.env.VIBE_TOKEN_ADDRESS;

    if (!privateKey) {
        throw new Error("PRIVATE_KEY not set");
    }
    if (!vibeTokenAddress) {
        throw new Error("VIBE_TOKEN_ADDRESS not set - Deploy VibeToken first!");
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
    const baseUri = "ipfs://bafybeiheivb76u6kigfg3x22ncvgc5dmbabwk7dpxrjg57cjlc7iey52ce/";
    const reclaimAddress = "0xF90085f5Fd1a3bEb8678623409b3811eCeC5f6A5"; // Base Sepolia Reclaim

    console.log("📋 Deployment Parameters:");
    console.log("  - Owner:", account.address);
    console.log("  - Base URI:", baseUri);
    console.log("  - Reclaim Address:", reclaimAddress);
    console.log("  - VibeToken Address:", vibeTokenAddress);
    console.log("");

    // 读取编译后的合约
    const artifact = await hre.artifacts.readArtifact("MusicConsensusSBTV4");

    // ABI 编码构造函数参数
    const encodedArgs = encodeAbiParameters(
        parseAbiParameters("address, string, address, address"),
        [account.address, baseUri, reclaimAddress, vibeTokenAddress]
    );

    const deployData = artifact.bytecode + encodedArgs.slice(2);

    console.log("📤 Sending deployment transaction...");

    // 部署合约
    const hash = await walletClient.sendTransaction({
        data: deployData,
        gas: 5500000n,
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...\n");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log("✅ MusicConsensusSBTV4 deployed successfully!");
        console.log("📍 Contract Address:", receipt.contractAddress);
        console.log("");
        console.log("🔗 BaseScan:", `https://sepolia.basescan.org/address/${receipt.contractAddress}`);
        console.log("");

        console.log("📊 Default Tier Costs:");
        console.log("   - Entry (Tier 1): 100 CVIB");
        console.log("   - Veteran (Tier 2): 500 CVIB");
        console.log("   - OG (Tier 3): 1000 CVIB");
        console.log("");

        console.log("📝 Next steps:");
        console.log("   1. Update MUSIC_CONSENSUS_SBT_ADDRESS in lib/web3/client.ts");
        console.log(`      export const MUSIC_CONSENSUS_SBT_ADDRESS = "${receipt.contractAddress}" as const;`);
        console.log("   2. Update VibeToken to authorize SBT contract as minter (optional):");
        console.log(`      await vibeToken.setMinter("${receipt.contractAddress}", true)`);
        console.log("   3. Test minting flow with $CVIB");
    } else {
        console.log("❌ Deployment failed!");
        console.log("Receipt:", receipt);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
