const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying MusicConsensusSBT...\n");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // 部署参数
    const baseUri = "ipfs://YOUR_METADATA_CID/"; // 替换为实际的 IPFS CID

    // 部署合约
    const MusicConsensusSBT = await ethers.getContractFactory("MusicConsensusSBT");
    const sbt = await MusicConsensusSBT.deploy(deployer.address, baseUri);

    await sbt.waitForDeployment();

    const contractAddress = await sbt.getAddress();

    console.log("✅ MusicConsensusSBT deployed to:", contractAddress);
    console.log("\n📋 Deployment Info:");
    console.log("- Owner:", deployer.address);
    console.log("- Base URI:", baseUri);
    console.log("- Network:", hre.network.name);

    // 验证合约 (如果在测试网)
    if (hre.network.name === "baseSepolia" || hre.network.name === "base") {
        console.log("\n⏳ Waiting for block confirmations...");
        await sbt.deploymentTransaction().wait(5);

        console.log("📝 Verifying contract on Basescan...");
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [deployer.address, baseUri],
            });
            console.log("✅ Contract verified!");
        } catch (error) {
            console.log("⚠️ Verification failed:", error.message);
        }
    }

    console.log("\n🎉 Deployment complete!");
    console.log("\nNext steps:");
    console.log("1. Update .env with contract address");
    console.log("2. Upload metadata to IPFS");
    console.log("3. Call setURI() with actual IPFS link");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
