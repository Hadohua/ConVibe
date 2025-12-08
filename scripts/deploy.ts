/**
 * scripts/deploy.ts - 部署 MusicConsensusSBT V2 合约
 * 
 * 使用方法:
 * npx hardhat run scripts/deploy.ts --network baseSepolia
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 开始部署 MusicConsensusSBT V2...\n");

    // 配置
    const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const BASE_URI = "ipfs://QmYourMetadataHash/"; // 替换为你的 IPFS 元数据

    if (!PRIVATE_KEY) {
        throw new Error("请在 .env 中设置 PRIVATE_KEY");
    }

    // 连接网络
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("📍 部署者地址:", wallet.address);

    // 获取余额
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 余额:", ethers.formatEther(balance), "ETH\n");

    if (balance === 0n) {
        throw new Error("余额不足，请先获取测试 ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    }

    // 读取编译后的合约
    const artifactPath = path.join(__dirname, "../artifacts/contracts/MusicConsensusSBT.sol/MusicConsensusSBT.json");

    if (!fs.existsSync(artifactPath)) {
        throw new Error("合约未编译，请先运行 npx hardhat compile");
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 创建合约工厂
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

    console.log("📦 部署合约中...");

    // 部署合约
    const contract = await factory.deploy(wallet.address, BASE_URI);

    console.log("⏳ 等待交易确认...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log("\n✅ 部署成功！");
    console.log("📝 合约地址:", contractAddress);
    console.log("🔗 区块浏览器: https://sepolia.basescan.org/address/" + contractAddress);

    // 保存合约地址
    const deploymentInfo = {
        network: "baseSepolia",
        chainId: 84532,
        address: contractAddress,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
        txHash: contract.deploymentTransaction()?.hash,
    };

    const deploymentPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
        fs.mkdirSync(deploymentPath, { recursive: true });
    }

    fs.writeFileSync(
        path.join(deploymentPath, "baseSepolia.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 部署信息已保存到 deployments/baseSepolia.json");
    console.log("\n⚠️  请更新 lib/web3/client.ts 中的合约地址:");
    console.log(`   export const MUSIC_CONSENSUS_SBT_ADDRESS = "${contractAddress}";`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });
