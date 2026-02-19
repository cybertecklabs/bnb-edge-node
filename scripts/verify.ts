import { ethers, network, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "deployments.json"), "utf-8"));
    console.log("\n🔍 Verifying contracts on", network.name, "...\n");

    const contracts = [
        { name: "NodeRegistry", address: deployment.NodeRegistry, args: [] },
        { name: "JobMarketplace", address: deployment.JobMarketplace, args: [deployment.usdc, deployment.NodeRegistry, deployment.deployer] },
        { name: "StorageManager", address: deployment.StorageManager, args: [deployment.usdc, deployment.deployer] },
        { name: "ReputationOracle", address: deployment.ReputationOracle, args: [deployment.NodeRegistry] },
        { name: "AgentRegistry", address: deployment.AgentRegistry, args: [] },
        { name: "PoRepLite", address: deployment.PoRepLite, args: [deployment.NodeRegistry] },
        { name: "ServiceLevelAgreement", address: deployment.ServiceLevelAgreement, args: [] },
    ];

    for (const c of contracts) {
        try {
            console.log(`🔍 Verifying ${c.name}...`);
            await run("verify:verify", { address: c.address, constructorArguments: c.args });
            console.log(`✅ ${c.name} verified!`);
        } catch (e: any) { console.log(`⚠️  ${c.name}: ${e.message}`); }
    }
    console.log("\n✅ Done!\n");
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
