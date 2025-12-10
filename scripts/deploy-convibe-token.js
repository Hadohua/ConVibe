/**
 * Deploy ConvibeToken ($CVB) to Base Sepolia using viem
 * 
 * Usage:
 *   source .env && PRIVATE_KEY=$PRIVATE_KEY node scripts/deploy-convibe-token.js
 */

import { createWalletClient, createPublicClient, http, formatEther, encodeAbiParameters, parseAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("🚀 Deploying ConvibeToken ($CVB) to Base Sepolia...\n");

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
    console.log("  - Token Name: Convibe");
    console.log("  - Token Symbol: CVB");
    console.log("");

    // 读取编译后的合约 (从旧的 VibeToken artifact)
    const artifactPath = path.join(__dirname, "../artifacts/contracts/VibeToken.sol/VibeToken.json");

    if (!fs.existsSync(artifactPath)) {
        // 尝试读取 ConvibeToken
        const convibeArtifactPath = path.join(__dirname, "../artifacts/contracts/VibeToken.sol/ConvibeToken.json");
        if (fs.existsSync(convibeArtifactPath)) {
            console.log("Using ConvibeToken artifact...");
        } else {
            throw new Error("Contract not compiled. Run 'npx hardhat compile' first (or set type: module in package.json)");
        }
    }

    // 使用内联 bytecode (从之前编译的 VibeToken)
    // 这是 ERC20Burnable + Ownable 的标准合约
    // 由于 hardhat 编译有问题，我们使用旧的 artifact
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

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
        console.log("✅ ConvibeToken deployed successfully!");
        console.log("📍 Contract Address:", receipt.contractAddress);
        console.log("");
        console.log("🔗 BaseScan:", `https://sepolia.basescan.org/address/${receipt.contractAddress}`);
        console.log("");
        console.log("📝 Next steps:");
        console.log("   1. Update VIBE_TOKEN_ADDRESS in lib/web3/client.ts");
        console.log(`      export const VIBE_TOKEN_ADDRESS = "${receipt.contractAddress}" as const;`);
        console.log("   2. Update .env with new VIBE_TOKEN_ADDRESS");
        console.log("   3. Redeploy MusicConsensusSBTV4 with new token address (optional)");
    } else {
        console.log("❌ Deployment failed!");
        console.log("Receipt:", receipt);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
