/**
 * Test script for $CVIB integration
 * 
 * Tests:
 * 1. Mint $CVIB tokens to deployer
 * 2. Check $CVIB balance
 * 3. Approve SBT contract to spend $CVIB
 * 4. Mint SBT badge using $CVIB
 * 5. Verify badge minted and $CVIB burned
 * 
 * Usage:
 *   source .env && PRIVATE_KEY=$PRIVATE_KEY node scripts/test-cvib-flow.js
 */

import { createWalletClient, createPublicClient, http, formatEther, parseEther, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// Contract addresses (deployed)
const VIBE_TOKEN_ADDRESS = "0x659b53fdf2b7a0ab4cc71d39b61b02c41245d074";
const SBT_V4_ADDRESS = "0x1f60a02b3ffa0876776d2a7dd02a550e1105d493";

// ABIs (minimal for testing)
const VibeTokenAbi = [
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
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
        name: "approve",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    {
        name: "allowance",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },
];

const SbtV4Abi = [
    {
        name: "mintWithCVIB",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "genreId", type: "uint256" },
            { name: "tier", type: "uint8" },
        ],
        outputs: [],
    },
    {
        name: "tierCost",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "tier", type: "uint8" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getUserBadges",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [{ name: "badges", type: "uint256[]" }],
    },
    {
        name: "getBadgeInfo",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
        ],
        outputs: [
            { name: "tier", type: "uint8" },
            { name: "lastVerified", type: "uint64" },
            { name: "status", type: "uint8" },
            { name: "isExpired", type: "bool" },
        ],
    },
];

const GENRE_NAMES = {
    1: "Pop",
    2: "Rock",
    3: "Hip-Hop",
    4: "R&B",
    5: "Electronic",
};

const TIER_NAMES = {
    1: "Entry",
    2: "Veteran",
    3: "OG",
};

async function main() {
    console.log("🧪 Testing $CVIB Integration Flow\n");
    console.log("=".repeat(50));

    // Setup
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY not set");
    }

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

    console.log("\n📋 Test Configuration:");
    console.log("  - Wallet:", account.address);
    console.log("  - VibeToken:", VIBE_TOKEN_ADDRESS);
    console.log("  - SBT V4:", SBT_V4_ADDRESS);

    // Step 1: Check initial $CVIB balance
    console.log("\n" + "=".repeat(50));
    console.log("📊 Step 1: Check Initial $CVIB Balance");

    let cvibBalance = await publicClient.readContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: VibeTokenAbi,
        functionName: "balanceOf",
        args: [account.address],
    });
    console.log("  - Current CVIB Balance:", formatEther(cvibBalance), "CVIB");

    // Step 2: Mint $CVIB tokens (1000 CVIB for testing)
    console.log("\n" + "=".repeat(50));
    console.log("🪙 Step 2: Mint Test $CVIB Tokens");

    const mintAmount = parseEther("1000"); // 1000 CVIB
    console.log("  - Minting:", formatEther(mintAmount), "CVIB");

    const mintHash = await walletClient.writeContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: VibeTokenAbi,
        functionName: "mint",
        args: [account.address, mintAmount],
    });
    console.log("  - TX Hash:", mintHash);
    console.log("  - Waiting for confirmation...");

    await publicClient.waitForTransactionReceipt({ hash: mintHash });
    console.log("  ✅ Mint confirmed!");

    cvibBalance = await publicClient.readContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: VibeTokenAbi,
        functionName: "balanceOf",
        args: [account.address],
    });
    console.log("  - New CVIB Balance:", formatEther(cvibBalance), "CVIB");

    // Step 3: Check tier costs
    console.log("\n" + "=".repeat(50));
    console.log("💰 Step 3: Check Tier Costs");

    for (let tier = 1; tier <= 3; tier++) {
        const cost = await publicClient.readContract({
            address: SBT_V4_ADDRESS,
            abi: SbtV4Abi,
            functionName: "tierCost",
            args: [tier],
        });
        console.log(`  - ${TIER_NAMES[tier]} (Tier ${tier}): ${formatEther(cost)} CVIB`);
    }

    // Step 4: Approve SBT contract
    console.log("\n" + "=".repeat(50));
    console.log("✅ Step 4: Approve SBT Contract");

    const tierCost = await publicClient.readContract({
        address: SBT_V4_ADDRESS,
        abi: SbtV4Abi,
        functionName: "tierCost",
        args: [1], // Entry tier
    });
    console.log("  - Approving:", formatEther(tierCost), "CVIB for Entry tier");

    const approveHash = await walletClient.writeContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: VibeTokenAbi,
        functionName: "approve",
        args: [SBT_V4_ADDRESS, tierCost],
    });
    console.log("  - TX Hash:", approveHash);
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log("  ✅ Approval confirmed!");

    const allowance = await publicClient.readContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: VibeTokenAbi,
        functionName: "allowance",
        args: [account.address, SBT_V4_ADDRESS],
    });
    console.log("  - Allowance:", formatEther(allowance), "CVIB");

    // Step 5: Mint SBT badge with $CVIB
    console.log("\n" + "=".repeat(50));
    console.log("🎵 Step 5: Mint SBT Badge with $CVIB");

    const genreId = 3; // Hip-Hop
    const tier = 1; // Entry
    console.log(`  - Minting: ${GENRE_NAMES[genreId]} badge at ${TIER_NAMES[tier]} tier`);
    console.log(`  - Cost: ${formatEther(tierCost)} CVIB`);

    try {
        const mintBadgeHash = await walletClient.writeContract({
            address: SBT_V4_ADDRESS,
            abi: SbtV4Abi,
            functionName: "mintWithCVIB",
            args: [BigInt(genreId), tier],
        });
        console.log("  - TX Hash:", mintBadgeHash);
        console.log("  - Waiting for confirmation...");

        const receipt = await publicClient.waitForTransactionReceipt({ hash: mintBadgeHash });

        if (receipt.status === "success") {
            console.log("  ✅ Badge minted successfully!");
        } else {
            console.log("  ❌ Badge minting failed!");
        }
    } catch (err) {
        console.log("  ❌ Error:", err.message);
        if (err.message.includes("Badge already exists")) {
            console.log("  ℹ️  Badge already minted for this genre");
        }
    }

    // Step 6: Verify results
    console.log("\n" + "=".repeat(50));
    console.log("🔍 Step 6: Verify Results");

    // Check final CVIB balance
    const finalCvibBalance = await publicClient.readContract({
        address: VIBE_TOKEN_ADDRESS,
        abi: VibeTokenAbi,
        functionName: "balanceOf",
        args: [account.address],
    });
    console.log("  - Final CVIB Balance:", formatEther(finalCvibBalance), "CVIB");
    console.log("  - CVIB Burned:", formatEther(cvibBalance - finalCvibBalance), "CVIB");

    // Check user badges
    const badges = await publicClient.readContract({
        address: SBT_V4_ADDRESS,
        abi: SbtV4Abi,
        functionName: "getUserBadges",
        args: [account.address],
    });
    console.log("  - User Badges:", badges.map(b => `${GENRE_NAMES[Number(b)] || `Genre ${b}`}`).join(", ") || "None");

    // Check badge details
    if (badges.length > 0) {
        console.log("\n  Badge Details:");
        for (const badgeId of badges) {
            const info = await publicClient.readContract({
                address: SBT_V4_ADDRESS,
                abi: SbtV4Abi,
                functionName: "getBadgeInfo",
                args: [account.address, badgeId],
            });
            const [badgeTier, lastVerified, status, isExpired] = info;
            console.log(`    - ${GENRE_NAMES[Number(badgeId)] || `Genre ${badgeId}`}: Tier ${badgeTier} (${TIER_NAMES[badgeTier]}), Active: ${status === 1}, Expired: ${isExpired}`);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Test Complete!\n");

    console.log("📊 Summary:");
    console.log(`  - CVIB Minted: ${formatEther(mintAmount)} CVIB`);
    console.log(`  - CVIB Burned: ${formatEther(cvibBalance - finalCvibBalance)} CVIB`);
    console.log(`  - Badges Owned: ${badges.length}`);
}

main().catch((error) => {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
});
