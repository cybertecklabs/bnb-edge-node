import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    const chainId = network.config.chainId || 31337;

    console.log("\n⬡ ═══════════════════════════════════════════════════════ ⬡");
    console.log("  🚀 BNB Edge Protocol — Core Contracts Deployment");
    console.log(`  📡 Network: ${network.name} (Chain ID: ${chainId})`);
    console.log(`  👤 Deployer: ${deployer.address}`);
    console.log(`  💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB`);
    console.log("⬡ ═══════════════════════════════════════════════════════ ⬡\n");

    let usdcAddress: string;
    if (chainId === 204) {
        usdcAddress = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f5";
    } else if (chainId === 5611) {
        usdcAddress = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
    } else {
        console.log("🪙  Deploying MockUSDC...");
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        const mockUsdc = await MockUSDC.deploy("USD Coin", "USDC", 6);
        await mockUsdc.waitForDeployment();
        usdcAddress = await mockUsdc.getAddress();
        console.log("✅  MockUSDC:", usdcAddress);
    }

    console.log("\n🚀 [1/3] Deploying WorkerRegistry...");
    const WorkerRegistry = await ethers.getContractFactory("WorkerRegistry");
    const workerRegistry = await WorkerRegistry.deploy(usdcAddress);
    await workerRegistry.waitForDeployment();
    const wrAddr = await workerRegistry.getAddress();
    console.log("✅  WorkerRegistry:", wrAddr);
    if (chainId !== 31337) await workerRegistry.deploymentTransaction()?.wait(2);

    console.log("🚀 [2/3] Deploying RewardVault...");
    const RewardVault = await ethers.getContractFactory("RewardVault");
    const rewardVault = await RewardVault.deploy(usdcAddress);
    await rewardVault.waitForDeployment();
    const rvAddr = await rewardVault.getAddress();
    console.log("✅  RewardVault:", rvAddr);
    if (chainId !== 31337) await rewardVault.deploymentTransaction()?.wait(2);

    console.log("🚀 [3/3] Deploying Slashing...");
    const Slashing = await ethers.getContractFactory("Slashing");
    const slashing = await Slashing.deploy(wrAddr);
    await slashing.waitForDeployment();
    const slashAddr = await slashing.getAddress();
    console.log("✅  Slashing:", slashAddr);
    if (chainId !== 31337) await slashing.deploymentTransaction()?.wait(2);

    console.log("\n🔗 Wiring protocol contracts...");
    const wrContract = await ethers.getContractAt("WorkerRegistry", wrAddr);
    await (await wrContract.setSlashingContract(slashAddr)).wait();
    console.log("✅  Contracts wired!");

    const deployment = {
        chainId, network: network.name, deployedAt: new Date().toISOString(),
        deployer: deployer.address, usdc: usdcAddress,
        WorkerRegistry: wrAddr, RewardVault: rvAddr, Slashing: slashAddr
    };

    fs.writeFileSync(path.join(__dirname, "..", "deployments_protocol.json"), JSON.stringify(deployment, null, 2));

    console.log("\n⬡ ═══════════ DEPLOYMENT COMPLETE ═══════════ ⬡");
    console.log(`  📋 WorkerRegistry: ${wrAddr}`);
    console.log(`  💼 RewardVault:    ${rvAddr}`);
    console.log(`  ⚔️  Slashing:       ${slashAddr}`);
    console.log("⬡ ═══════════════════════════════════════════ ⬡\n");
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
