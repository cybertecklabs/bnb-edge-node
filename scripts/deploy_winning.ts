import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    // Using the testUSDC provided
    const testUSDC = "0x4410C9D5D957D385EeE34092aE2B16490D357ce3";

    console.log("Deploying WorkerRegistry...");
    const WorkerRegistry = await hre.ethers.getContractFactory("WorkerRegistry");
    const registry = await WorkerRegistry.deploy(testUSDC);
    await registry.waitForDeployment();
    console.log("WorkerRegistry deployed to:", await registry.getAddress());

    console.log("Deploying RewardVault...");
    const RewardVault = await hre.ethers.getContractFactory("RewardVault");
    const vault = await RewardVault.deploy(testUSDC);
    await vault.waitForDeployment();
    console.log("RewardVault deployed to:", await vault.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
