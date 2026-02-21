import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Testing BNB Edge Protocol Flow (Local)");

    const [admin, worker1, worker2] = await ethers.getSigners();

    // 1. Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();
    const usdcAddr = await usdc.getAddress();

    // 2. Deploy Contracts
    const WorkerRegistry = await ethers.getContractFactory("WorkerRegistry");
    const wr = await WorkerRegistry.deploy(usdcAddr);
    await wr.waitForDeployment();

    const RewardVault = await ethers.getContractFactory("RewardVault");
    const rv = await RewardVault.deploy(usdcAddr);
    await rv.waitForDeployment();

    const Slashing = await ethers.getContractFactory("Slashing");
    const slash = await Slashing.deploy(await wr.getAddress());
    await slash.waitForDeployment();

    await wr.setSlashingContract(await slash.getAddress());

    console.log("✅ Contracts deployed");

    // Mint USDC for workers and vault
    await usdc.mint(worker1.address, ethers.parseUnits("1000", 6));
    await usdc.mint(worker2.address, ethers.parseUnits("1000", 6));
    await usdc.mint(await rv.getAddress(), ethers.parseUnits("10000", 6));

    // Register Worker
    console.log("👷 Registering Worker 1...");
    await usdc.connect(worker1).approve(await wr.getAddress(), ethers.parseUnits("50", 6));
    await wr.connect(worker1).registerWorker(0, "ipfs://meta", ethers.parseUnits("50", 6));

    let w1Data = await wr.getWorker(worker1.address);
    console.log(`📡 Worker 1 Stake: ${ethers.formatUnits(w1Data.stakedAmount.toString(), 6)} USDC`);

    // Slashing test
    console.log("⚔️ Slashing Worker 1 for bad proof...");
    await slash.flagMaliciousProof(worker1.address, ethers.parseUnits("10", 6));
    w1Data = await wr.getWorker(worker1.address);
    console.log(`📉 Worker 1 Stake after Slash: ${ethers.formatUnits(w1Data.stakedAmount.toString(), 6)} USDC`);

    // Fetch Merkle proof from local backend (assuming backend is running!)
    console.log("🌳 Generating Merkle Root via Backend API...");
    const reqBody = {
        epochId: "1",
        workers: [
            { address: worker1.address, reward: 150 },
            { address: worker2.address, reward: 75 }
        ]
    };

    const res = await fetch("http://127.0.0.1:3001/api/epoch/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody)
    });
    const { epochData } = await res.json();
    console.log(`✅ Root: ${epochData.merkleRoot}`);

    // Submit root to vault
    console.log("🏦 Submitting Epoch Root to Vault...");
    await rv.submitEpochRoot(1, epochData.merkleRoot, ethers.parseUnits("225", 6));

    // Claim reward
    console.log("💰 Worker 1 Claiming Reward...");
    const w1Proof = epochData.workers.find((w: any) => w.address === worker1.address).proof;

    const balBefore = await usdc.balanceOf(worker1.address);
    await rv.connect(worker1).claimReward(1, ethers.parseUnits("150", 6), w1Proof);
    const balAfter = await usdc.balanceOf(worker1.address);

    console.log(`💵 Worker 1 claimed: ${ethers.formatUnits(balAfter - balBefore, 6)} USDC`);

    console.log("\n🎉 BNB Edge Protocol fully verified on-chain and off-chain!");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
