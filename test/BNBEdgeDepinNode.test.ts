import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BNB Edge DePIN Node — Full Test Suite", function () {
    let deployer: SignerWithAddress, nodeOperator: SignerWithAddress,
        client: SignerWithAddress, treasury: SignerWithAddress, otherUser: SignerWithAddress;
    let nodeRegistry: any, jobMarketplace: any, storageManager: any, reputationOracle: any, mockUsdc: any;

    async function deployAll() {
        [deployer, nodeOperator, client, treasury, otherUser] = await ethers.getSigners();
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        mockUsdc = await MockUSDC.deploy("USD Coin", "USDC", 6);
        const NodeRegistry = await ethers.getContractFactory("NodeRegistry");
        nodeRegistry = await NodeRegistry.deploy();
        const JobMarketplace = await ethers.getContractFactory("JobMarketplace");
        jobMarketplace = await JobMarketplace.deploy(await mockUsdc.getAddress(), await nodeRegistry.getAddress(), treasury.address);
        const StorageManager = await ethers.getContractFactory("StorageManager");
        storageManager = await StorageManager.deploy(await mockUsdc.getAddress(), treasury.address);
        const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
        reputationOracle = await ReputationOracle.deploy(await nodeRegistry.getAddress());
        await nodeRegistry.setJobMarketplace(await jobMarketplace.getAddress());
        await nodeRegistry.setReputationOracle(await reputationOracle.getAddress());
        await storageManager.setReputationOracle(await reputationOracle.getAddress());
    }

    describe("NodeRegistry", function () {
        beforeEach(deployAll);
        it("registers GPU node with correct stake and emits NodeRegistered", async function () {
            const stake = ethers.parseEther("0.05");
            await expect(nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://QmGPU", { value: stake }))
                .to.emit(nodeRegistry, "NodeRegistered").withArgs(nodeOperator.address, 0, stake, "ipfs://QmGPU");
            const node = await nodeRegistry.getNode(nodeOperator.address);
            expect(node.status).to.equal(1);
            expect(node.reputationScore).to.equal(75);
        });
        it("reverts if stake below minimum", async function () {
            await expect(nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://t", { value: ethers.parseEther("0.01") }))
                .to.be.revertedWithCustomError(nodeRegistry, "InsufficientStake");
        });
        it("updates uptime after heartbeat", async function () {
            await nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://t", { value: ethers.parseEther("0.05") });
            await time.increase(180);
            await nodeRegistry.connect(nodeOperator).heartbeat();
            const node = await nodeRegistry.getNode(nodeOperator.address);
            expect(node.totalUptime).to.be.closeTo(180, 5);
        });
        it("allows deregister and returns stake", async function () {
            const stake = ethers.parseEther("0.05");
            await nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://t", { value: stake });
            const before = await ethers.provider.getBalance(nodeOperator.address);
            const tx = await nodeRegistry.connect(nodeOperator).deregister();
            const receipt = await tx.wait();
            const gas = receipt!.gasUsed * receipt!.gasPrice;
            expect(await ethers.provider.getBalance(nodeOperator.address)).to.equal(before + stake - gas);
        });
        it("counts active nodes correctly", async function () {
            await nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://1", { value: ethers.parseEther("0.05") });
            await nodeRegistry.connect(client).registerNode(1, "ipfs://2", { value: ethers.parseEther("0.02") });
            expect(await nodeRegistry.activeNodeCount()).to.equal(2);
            await nodeRegistry.connect(nodeOperator).deregister();
            expect(await nodeRegistry.activeNodeCount()).to.equal(1);
        });
        it("reverts if non-marketplace calls recordJobCompleted", async function () {
            await nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://t", { value: ethers.parseEther("0.05") });
            await expect(nodeRegistry.connect(otherUser).recordJobCompleted(nodeOperator.address))
                .to.be.revertedWithCustomError(nodeRegistry, "UnauthorizedCaller");
        });
    });

    describe("JobMarketplace — Escrow Flow", function () {
        const PAYMENT = ethers.parseUnits("50", 6);
        beforeEach(async function () {
            await deployAll();
            await nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://gpu", { value: ethers.parseEther("0.05") });
            await mockUsdc.mint(client.address, ethers.parseUnits("1000", 6));
            await mockUsdc.connect(client).approve(await jobMarketplace.getAddress(), ethers.parseUnits("1000", 6));
        });
        it("creates job and locks USDC", async function () {
            const dl = (await time.latest()) + 3600;
            await jobMarketplace.connect(client).createJob(0, PAYMENT, dl, "ipfs://in", 50);
            expect(await mockUsdc.balanceOf(await jobMarketplace.getAddress())).to.equal(PAYMENT);
        });
        it("reverts createJob if payment is 0", async function () {
            await expect(jobMarketplace.connect(client).createJob(0, 0, (await time.latest()) + 3600, "ipfs://in", 50))
                .to.be.revertedWithCustomError(jobMarketplace, "InvalidPayment");
        });
        it("full happy path: create→accept→submit (96% node, 4% treasury)", async function () {
            const dl = (await time.latest()) + 3600;
            await jobMarketplace.connect(client).createJob(0, PAYMENT, dl, "ipfs://in", 0);
            await jobMarketplace.connect(nodeOperator).acceptJob(1);
            await jobMarketplace.connect(nodeOperator).submitResult(1, "ipfs://out", ethers.keccak256(ethers.toUtf8Bytes("r")));
            const fee = (PAYMENT * 400n) / 10000n;
            expect(await mockUsdc.balanceOf(treasury.address)).to.equal(fee);
            expect(await mockUsdc.balanceOf(nodeOperator.address)).to.equal(PAYMENT - fee);
        });
        it("reverts submitResult if not assigned node", async function () {
            const dl = (await time.latest()) + 3600;
            await jobMarketplace.connect(client).createJob(0, PAYMENT, dl, "ipfs://in", 0);
            await jobMarketplace.connect(nodeOperator).acceptJob(1);
            await expect(jobMarketplace.connect(otherUser).submitResult(1, "ipfs://x", ethers.keccak256(ethers.toUtf8Bytes("f"))))
                .to.be.revertedWithCustomError(jobMarketplace, "NotAssignedNode");
        });
        it("client cancels OPEN job and reclaims USDC", async function () {
            await jobMarketplace.connect(client).createJob(0, PAYMENT, (await time.latest()) + 3600, "ipfs://in", 0);
            await jobMarketplace.connect(client).cancelJob(1);
            expect(await mockUsdc.balanceOf(client.address)).to.equal(ethers.parseUnits("1000", 6));
        });
        it("cannot cancel ASSIGNED job", async function () {
            await jobMarketplace.connect(client).createJob(0, PAYMENT, (await time.latest()) + 3600, "ipfs://in", 0);
            await jobMarketplace.connect(nodeOperator).acceptJob(1);
            await expect(jobMarketplace.connect(client).cancelJob(1)).to.be.revertedWithCustomError(jobMarketplace, "JobNotOpen");
        });
        it("updates node jobsCompleted", async function () {
            await jobMarketplace.connect(client).createJob(0, PAYMENT, (await time.latest()) + 3600, "ipfs://in", 0);
            await jobMarketplace.connect(nodeOperator).acceptJob(1);
            await jobMarketplace.connect(nodeOperator).submitResult(1, "ipfs://out", ethers.keccak256(ethers.toUtf8Bytes("r")));
            expect((await nodeRegistry.getNode(nodeOperator.address)).jobsCompleted).to.equal(1);
        });
    });

    describe("ReputationOracle — AI Predictor", function () {
        beforeEach(async function () {
            await deployAll();
            await nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://t", { value: ethers.parseEther("0.05") });
        });
        it("gives reasonable score for new node (>30)", async function () {
            const score = await reputationOracle.predictNodeReliability(nodeOperator.address);
            expect(score).to.be.greaterThan(30);
            expect(score).to.be.lessThanOrEqual(100);
        });
        it("score decreases with stale heartbeat", async function () {
            const fresh = await reputationOracle.predictNodeReliability(nodeOperator.address);
            await time.increase(7200);
            expect(await reputationOracle.predictNodeReliability(nodeOperator.address)).to.be.lessThan(fresh);
        });
        it("updateScore persists history", async function () {
            await reputationOracle.updateScore(nodeOperator.address);
            const h = await reputationOracle.getScoreHistory(nodeOperator.address);
            expect(h.length).to.equal(1);
            expect(h[0].score).to.be.greaterThan(0);
        });
        it("scoreTrend returns negative when heartbeat stales", async function () {
            await reputationOracle.updateScore(nodeOperator.address);
            await time.increase(7200);
            await reputationOracle.updateScore(nodeOperator.address);
            expect(await reputationOracle.scoreTrend(nodeOperator.address)).to.be.lessThan(0);
        });
    });

    describe("StorageManager", function () {
        beforeEach(async function () {
            await deployAll();
            await mockUsdc.mint(client.address, ethers.parseUnits("100", 6));
            await mockUsdc.connect(client).approve(await storageManager.getAddress(), ethers.parseUnits("100", 6));
            await nodeRegistry.connect(nodeOperator).registerNode(1, "ipfs://stor", { value: ethers.parseEther("0.02") });
        });
        it("storeFile locks correct USDC (1GB × 3mo = $3)", async function () {
            await storageManager.connect(client).storeFile("ipfs://QmF", nodeOperator.address, 1_073_741_824, 3, "key");
            expect(await mockUsdc.balanceOf(await storageManager.getAddress())).to.equal(ethers.parseUnits("3", 6));
        });
        it("storagePriceQuote returns correct value", async function () {
            expect(await storageManager.storagePriceQuote(1_073_741_824, 6)).to.equal(ethers.parseUnits("6", 6));
        });
        it("owner can reassign file", async function () {
            await storageManager.connect(client).storeFile("ipfs://QmF", nodeOperator.address, 1_073_741_824, 1, "key");
            const fid = (await storageManager.getOwnerFiles(client.address))[0];
            await nodeRegistry.connect(otherUser).registerNode(1, "ipfs://new", { value: ethers.parseEther("0.02") });
            await expect(storageManager.connect(client).reassignFile(fid, otherUser.address)).to.emit(storageManager, "FileReassigned");
        });
        it("delete gives prorated refund", async function () {
            await storageManager.connect(client).storeFile("ipfs://Qm", nodeOperator.address, 1_073_741_824, 6, "k");
            const fid = (await storageManager.getOwnerFiles(client.address))[0];
            await time.increase(30 * 86400);
            const before = await mockUsdc.balanceOf(client.address);
            await storageManager.connect(client).deleteFile(fid);
            expect(await mockUsdc.balanceOf(client.address)).to.be.greaterThan(before);
        });
    });

    describe("Full E2E Integration", function () {
        it("complete flow: register→stake→create→accept→submit→verify→reputation", async function () {
            await deployAll();
            console.log("\n  ⬡ ═══ E2E INTEGRATION TEST ═══ ⬡\n");
            await nodeRegistry.connect(nodeOperator).registerNode(0, "ipfs://QmA100", { value: ethers.parseEther("0.05") });
            console.log("  ✅ Node registered");
            const payment = ethers.parseUnits("50", 6);
            await mockUsdc.mint(client.address, payment);
            await mockUsdc.connect(client).approve(await jobMarketplace.getAddress(), payment);
            console.log("  ✅ Client funded $50 USDC");
            await jobMarketplace.connect(client).createJob(0, payment, (await time.latest()) + 3600, "ipfs://QmIn", 50);
            console.log("  ✅ Job created, USDC locked");
            await jobMarketplace.connect(nodeOperator).acceptJob(1);
            console.log("  ✅ Job accepted");
            await time.increase(100);
            await nodeRegistry.connect(nodeOperator).heartbeat();
            console.log("  ✅ Heartbeat sent");
            await jobMarketplace.connect(nodeOperator).submitResult(1, "ipfs://QmOut", ethers.keccak256(ethers.toUtf8Bytes("model-v1")));
            console.log("  ✅ Result submitted, payout released");
            const fee = (payment * 400n) / 10000n;
            expect(await mockUsdc.balanceOf(treasury.address)).to.equal(fee);
            expect(await mockUsdc.balanceOf(nodeOperator.address)).to.equal(payment - fee);
            console.log(`  💰 Treasury: $${ethers.formatUnits(fee, 6)} | Node: $${ethers.formatUnits(payment - fee, 6)}`);
            await reputationOracle.updateScore(nodeOperator.address);
            const node = await nodeRegistry.getNode(nodeOperator.address);
            console.log(`  🧠 Reputation: ${node.reputationScore}`);
            expect(node.jobsCompleted).to.equal(1);
            expect(node.totalUptime).to.be.greaterThan(0);
            console.log("\n  ⬡ ═══ E2E TEST PASSED ✅ ═══ ⬡\n");
        });
    });
});
