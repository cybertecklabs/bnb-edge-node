import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    const chainId = network.config.chainId || 31337;

    console.log("\n⬡ ═══════════════════════════════════════════════════════ ⬡");
    console.log("  🚀 BNB Edge DePIN Node — Deployment Pipeline");
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

    console.log("\n🚀 [1/4] Deploying NodeRegistry...");
    const NodeRegistry = await ethers.getContractFactory("NodeRegistry");
    const nodeRegistry = await NodeRegistry.deploy();
    await nodeRegistry.waitForDeployment();
    const nrAddr = await nodeRegistry.getAddress();
    console.log("✅  NodeRegistry:", nrAddr);
    if (chainId !== 31337) await nodeRegistry.deploymentTransaction()?.wait(2);

    console.log("🚀 [2/4] Deploying JobMarketplace...");
    const JobMarketplace = await ethers.getContractFactory("JobMarketplace");
    const jobMarketplace = await JobMarketplace.deploy(usdcAddress, nrAddr, deployer.address);
    await jobMarketplace.waitForDeployment();
    const jmAddr = await jobMarketplace.getAddress();
    console.log("✅  JobMarketplace:", jmAddr);
    if (chainId !== 31337) await jobMarketplace.deploymentTransaction()?.wait(2);

    console.log("🚀 [3/4] Deploying StorageManager...");
    const StorageManager = await ethers.getContractFactory("StorageManager");
    const storageManager = await StorageManager.deploy(usdcAddress, deployer.address);
    await storageManager.waitForDeployment();
    const smAddr = await storageManager.getAddress();
    console.log("✅  StorageManager:", smAddr);
    if (chainId !== 31337) await storageManager.deploymentTransaction()?.wait(2);

    console.log("🚀 [4/7] Deploying ReputationOracle...");
    const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
    const reputationOracle = await ReputationOracle.deploy(nrAddr);
    await reputationOracle.waitForDeployment();
    const roAddr = await reputationOracle.getAddress();
    console.log("✅  ReputationOracle:", roAddr);

    console.log("🚀 [5/7] Deploying AgentRegistry (ERC-8004/BAP-578)...");
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
    const arAddr = await agentRegistry.getAddress();
    console.log("✅  AgentRegistry:", arAddr);

    console.log("🚀 [6/7] Deploying PoRepLite...");
    const PoRepLite = await ethers.getContractFactory("PoRepLite");
    const porepLite = await PoRepLite.deploy(nrAddr);
    await porepLite.waitForDeployment();
    const prAddr = await porepLite.getAddress();
    console.log("✅  PoRepLite:", prAddr);

    console.log("🚀 [7/7] Deploying ServiceLevelAgreement...");
    const ServiceLevelAgreement = await ethers.getContractFactory("ServiceLevelAgreement");
    const sla = await ServiceLevelAgreement.deploy();
    await sla.waitForDeployment();
    const slaAddr = await sla.getAddress();
    console.log("✅  SLA:", slaAddr);

    console.log("\n🔗 Wiring contracts...");
    await (await nodeRegistry.setJobMarketplace(jmAddr)).wait();
    await (await nodeRegistry.setReputationOracle(roAddr)).wait();
    await (await nodeRegistry.setPoRepVerifier(prAddr)).wait();
    await (await storageManager.setReputationOracle(roAddr)).wait();
    console.log("✅  All contracts wired!");

    const deployment = {
        chainId, network: network.name, deployedAt: new Date().toISOString(),
        deployer: deployer.address, usdc: usdcAddress,
        NodeRegistry: nrAddr, JobMarketplace: jmAddr,
        StorageManager: smAddr, ReputationOracle: roAddr,
        AgentRegistry: arAddr, PoRepLite: prAddr, ServiceLevelAgreement: slaAddr
    };

    fs.writeFileSync(path.join(__dirname, "..", "deployments.json"), JSON.stringify(deployment, null, 2));

    const frontendDir = path.join(__dirname, "..", "frontend");
    if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });
    fs.writeFileSync(path.join(frontendDir, ".env.local"),
        `NEXT_PUBLIC_CHAIN_ID=${chainId}\nNEXT_PUBLIC_NODE_REGISTRY=${nrAddr}\nNEXT_PUBLIC_JOB_MARKETPLACE=${jmAddr}\nNEXT_PUBLIC_STORAGE_MANAGER=${smAddr}\nNEXT_PUBLIC_REPUTATION_ORACLE=${roAddr}\nNEXT_PUBLIC_AGENT_REGISTRY=${arAddr}\nNEXT_PUBLIC_POREP_LITE=${prAddr}\nNEXT_PUBLIC_SLA=${slaAddr}\nNEXT_PUBLIC_USDC=${usdcAddress}\n`
    );

    console.log("\n⬡ ═══════════ DEPLOYMENT COMPLETE ═══════════ ⬡");
    console.log(`  📋 NodeRegistry:     ${nrAddr}`);
    console.log(`  💼 JobMarketplace:   ${jmAddr}`);
    console.log(`  📦 StorageManager:   ${smAddr}`);
    console.log(`  🧠 ReputationOracle: ${roAddr}`);
    console.log(`  🤖 AgentRegistry:    ${arAddr}`);
    console.log(`  🛡️  PoRepLite:        ${prAddr}`);
    console.log(`  📜 SLA:              ${slaAddr}`);
    console.log("⬡ ═══════════════════════════════════════════ ⬡\n");
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
