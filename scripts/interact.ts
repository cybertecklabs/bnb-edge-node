import { ethers } from "hardhat";

async function main() {
    const [user] = await ethers.getSigners();
    console.log("Interacting with contracts using:", user.address);

    // This script assumes deployments.json exists
    const fs = require("fs");
    const path = require("path");
    const deploymentsPath = path.join(__dirname, "..", "deployments.json");

    if (!fs.existsSync(deploymentsPath)) {
        console.error("❌ deployments.json not found. Deploy contracts first!");
        return;
    }

    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));

    const nodeRegistry = await ethers.getContractAt("NodeRegistry", deployments.NodeRegistry);
    const jobMarketplace = await ethers.getContractAt("JobMarketplace", deployments.JobMarketplace);
    const storageManager = await ethers.getContractAt("StorageManager", deployments.StorageManager);
    const usdc = await ethers.getContractAt("MockUSDC", deployments.usdc);

    console.log("\n1️⃣ Registering GPU Node...");
    try {
        const tx = await nodeRegistry.registerNode(0, "ipfs://QmGPUspecs", {
            value: ethers.parseEther("0.05")
        });
        await tx.wait();
        console.log("✅ Node Registered! Hash:", tx.hash);
    } catch (e: any) {
        console.log("⚠️ Registration failed (likely already registered):", e.reason || e.message);
    }

    console.log("\n2️⃣ Staking more BNB...");
    try {
        const tx = await user.sendTransaction({
            to: deployments.NodeRegistry,
            value: ethers.parseEther("0.01")
        });
        await tx.wait();
        console.log("✅ Extra Stake Added! Hash:", tx.hash);
    } catch (e: any) {
        console.log("❌ Staking failed:", e.message);
    }

    console.log("\n3️⃣ Creating Job (USDC required)...");
    try {
        const payment = ethers.parseUnits("10", 6);
        // Mint/Approve USDC if needed
        const balance = await usdc.balanceOf(user.address);
        if (balance < payment) {
            console.log("🪙 Minting Mock USDC...");
            await (await usdc.mint(user.address, payment * 10n)).wait();
        }
        await (await usdc.approve(deployments.JobMarketplace, payment)).wait();

        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const tx = await jobMarketplace.createJob(0, payment, deadline, "ipfs://QmInput", 0);
        await tx.wait();
        console.log("✅ Job Created! Hash:", tx.hash);
    } catch (e: any) {
        console.log("❌ Job creation failed:", e.message);
    }

    console.log("\n4️⃣ Storing File...");
    try {
        const cost = await storageManager.storagePriceQuote(1024 * 1024 * 100, 3); // 100MB for 3 months
        await (await usdc.approve(deployments.StorageManager, cost)).wait();
        const tx = await storageManager.storeFile("ipfs://QmFile", user.address, 1024 * 1024 * 100, 3, "enc-key");
        await tx.wait();
        console.log("✅ File Stored! Hash:", tx.hash);
    } catch (e: any) {
        console.log("❌ Storage failed:", e.message);
    }

    console.log("\n✨ Interaction complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
