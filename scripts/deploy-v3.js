/**
 * Deploy MusicConsensusSBTV3 with Reclaim on-chain verification
 * 
 * Usage:
 *   source .env && PRIVATE_KEY=$PRIVATE_KEY npx hardhat run scripts/deploy-v3.js --network baseSepolia
 */

import hre from "hardhat";
import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

async function main() {
    console.log("🚀 Deploying MusicConsensusSBTV3 to Base Sepolia...\n");

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
    const baseUri = "ipfs://bafybeiheivb76u6kigfg3x22ncvgc5dmbabwk7dpxrjg57cjlc7iey52ce/";
    const reclaimAddress = "0xF90085f5Fd1a3bEb8678623409b3811eCeC5f6A5";

    console.log("📋 Deployment Parameters:");
    console.log("  - Owner:", account.address);
    console.log("  - Base URI:", baseUri);
    console.log("  - Reclaim Address:", reclaimAddress);
    console.log("");

    // 读取编译后的合约
    const artifact = await hre.artifacts.readArtifact("MusicConsensusSBTV3");

    // ABI 编码构造函数参数
    const { encodeAbiParameters, parseAbiParameters } = await import("viem");
    const encodedArgs = encodeAbiParameters(
        parseAbiParameters("address, string, address"),
        [account.address, baseUri, reclaimAddress]
    );

    const deployData = artifact.bytecode + encodedArgs.slice(2);

    console.log("📤 Sending deployment transaction...");

    // 部署合约
    const hash = await walletClient.sendTransaction({
        data: deployData,
        gas: 5000000n,
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...\n");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log("✅ Contract deployed successfully!");
        console.log("📍 Contract Address:", receipt.contractAddress);
        console.log("");
        console.log("🔗 BaseScan:", `https://sepolia.basescan.org/address/${receipt.contractAddress}`);
        console.log("");
        console.log("📝 Next steps:");
        console.log("   1. Update MUSIC_CONSENSUS_SBT_ADDRESS in lib/web3/client.ts");
        console.log("   2. Update ABI in lib/web3/abi.ts (add mintWithProof)");
        console.log("   3. Update useMintSBT.ts to pass Reclaim proof");
    } else {
        console.log("❌ Deployment failed!");
        console.log("Receipt:", receipt);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
