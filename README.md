# 🔥 BNB Edge DePIN Node: The Sovereign AI Infrastructure Layer

ERC‑8004 AI Agents · Proof‑of‑Replication GPU Verification · Enterprise SLA Automation · BNB Chain

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg)](https://hardhat.org/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org/)
[![opBNB](https://img.shields.io/badge/BNB%20Chain-opBNB-yellow)](https://bnbchain.org/en/opbnb)
[![ERC-8004](https://img.shields.io/badge/Standard-ERC--8004-blueviolet)](https://eips.ethereum.org/EIPS/eip-8004)

---

## 📖 Table of Contents

- [Vision: The DePIN Operating System for AI Agents](#-vision-the-depin-operating-system-for-ai-agents)
- [Why EdgeGrid? The Unfair Advantage](#-why-edgegrid-the-unfair-advantage)
- [Core Architecture: 7 Smart Contracts](#-core-architecture-7-smart-contracts)
- [✨ Legendary Features](#-legendary-features)
- [🛠️ Technology Stack](#-technology-stack)
- [📦 Quick Start (Deploy in 10 Minutes)](#-quick-start-deploy-in-10-minutes)
- [🧪 Testing & Verification](#-testing--verification)
- [🌐 Frontend Dashboard](#-frontend-dashboard)
- [📊 Subgraph & Real-Time Analytics](#-subgraph--real-time-analytics)
- [🤖 AI Microservice (FastAPI + WebSocket)](#-ai-microservice-fastapi--websocket)
- [📄 License](#-license)

---

## 🌌 Vision: The DePIN Operating System for AI Agents

We are entering an era where AI agents will autonomously transact, compute, and negotiate. Today’s cloud infrastructure is centralized, expensive, and opaque. BNB Edge DePIN Node is the first decentralized physical infrastructure network (DePIN) purpose-built for autonomous AI agents on BNB Chain.

Instead of treating GPUs and storage as simple commodities, we provide a verifiable, reputation-driven marketplace where:

- Hardware is cryptographically proven (no more GPU spoofing).
- AI agents have portable, on-chain identities (ERC-8004 / BAP-578).
- Reliability is enforced by smart contracts (enterprise SLAs with automated penalties).
- Payments are stable, instant, and gasless (USDC on opBNB).

---

## ⚡ Why EdgeGrid? The Unfair Advantage

| Feature | Akash | Render | io.net | **BNB EdgeGrid** |
| :--- | :--- | :--- | :--- | :--- |
| **BNB Chain Native** | ❌ Cosmos | ❌ Solana | ❌ Solana | ✅ **opBNB (0.45s blocks)** |
| **AI Agent Identity** | ❌ | ❌ | ❌ | ✅ **ERC-8004 / BAP-578** |
| **Hardware Proof** | ❌ | ❌ | ❌ | ✅ **Cryptographic GPU verification** |
| **Enterprise SLAs** | ❌ | ❌ | ❌ | ✅ **Stake-back guarantees** |
| **Stablecoin Payments**| ❌ AKT | ❌ RENDER | ❌ IO | ✅ **Native USDC, gasless** |

---

## 🏛️ Core Architecture: 7 Smart Contracts

Our modular architecture separates concerns for maximum flexibility and security.

- `NodeRegistry.sol`: Stake, heartbeat, reputation, slashing.
- `AgentRegistry.sol`: ERC-8004 agent identity + BAP-578 NFAs.
- `JobMarketplace.sol`: Job escrow, assignment, reverse auction.
- `ReputationOracle.sol`: On-chain AI scoring (history + prediction).
- `PoRepLite.sol`: Proof-of-Replication GPU challenges.
- `ServiceLevelAgreement.sol`: Tiered SLAs with automated penalties.
- `StorageManager.sol`: IPFS file storage, reassignment.

---

## ✨ Legendary Features

### 1. Verifiable AI Agent Identity (ERC-8004 & BAP-578)
We are the first to implement ERC-8004, the new Ethereum standard for AI agent identity, and BAP-578, BNB Chain’s Non-Fungible Agent specification.

### 2. Proof-of-Replication (PoRep) Lite – GPU Hardware Verification
Before a GPU node is listed, it must complete a time-boxed compute challenge (MobileNetV3 inference) to prove its hardware claims.

### 3. Enterprise SLAs with Automated On-Chain Penalties
Tiered SLAs (BASIC, GOLD, PLATINUM) with automated penalty payouts from node stake if reliability targets are missed.

### 4. Built in Public: Live, Verifiable Build Log
A dedicated timeline fetching GitHub commits to prove development transparency and protocol evolution.

### 5. OpenClaw Mobile AI Agent Integration
Connect your smartphone (via Termux) to operate as a local, fully decentralized AI agent node. Control and monitor the agent directly from the BNB Edge dashboard. See [MOBILE_AGENT_SETUP.md](./MOBILE_AGENT_SETUP.md) for 24/7 setup instructions on Android.

### 6. Reverse Auction Engine & AWS Cost Comparator
Nodes bid down prices in real-time, often reaching 70-80% savings compared to AWS/GCP.

---

## 🔗 Live Protocol — opBNB Testnet

| Contract | Address | Explorer |
|---|---|---|
| **WorkerRegistry** | `FILL_AFTER_DEPLOY` | [opBNBscan](https://testnet.opbnbscan.com/address/FILL_AFTER_DEPLOY) |
| **RewardVault** | `FILL_AFTER_DEPLOY` | [opBNBscan](https://testnet.opbnbscan.com/address/FILL_AFTER_DEPLOY) |
| **Test USDC** | `0x4410C9D5D957D385EeE34092aE2B16490D357ce3` | [opBNBscan](https://testnet.opbnbscan.com/address/0x4410C9D5D957D385EeE34092aE2B16490D357ce3) |

> **Network:** opBNB Testnet (Chain ID: 5611) · **RPC:** `https://opbnb-testnet-rpc.bnbchain.org`

---

## 🧠 Live Protocol Architecture

```
[Dashboard Frontend] ←─ ethers.js ─→ [WorkerRegistry.sol]  ←→  [RewardVault.sol]
       │                                (stake, register)        (epoch roots, claims)
       │ JWT / REST                              ↑                       ↑
       └──────────────→ [Node.js Backend] ←──────────────────────────────┘
                          GET /api/epoch/proof   ← Merkle proof server
                          GET /api/agent/status  ← OpenClaw Termux agent
```

---

## 🛠️ Technology Stack

- **Blockchain**: opBNB (Chain ID: 5611), Solidity 0.8.20
- **Contracts**: Hardhat, Ethers.js v6, OpenZeppelin v5
- **Frontend**: Vanilla HTML/CSS/JS · Ethers.js UMD · Cyberpunk UI
- **Backend**: Node.js, Express, Prisma (SQLite), Socket.IO
- **Merkle Rewards**: merkletreejs + keccak256
- **AI Agent**: OpenClaw via Termux (mobile 24/7 node)

---

## 📦 Quick Start (Deploy in 10 Minutes)

### 1. Get testnet BNB from the faucet
Visit [faucet.opbnb.network](https://faucet.opbnb.network) and fund your deployer wallet.

### 2. Set your private key
```bash
echo "PRIVATE_KEY=0xYourActualPrivateKey" > .env
```

### 3. Deploy contracts
```bash
npx hardhat run scripts/deploy_winning.ts --network opbnbTestnet
```

### 4. Inject addresses into the frontend
```bash
# Fill in the addresses in deployments_testnet.json, then:
node scripts/inject-addresses.js
```

### 5. Run the backend
```bash
cd backend && npm install && npm run dev
```

### 6. Serve the frontend
```bash
cd frontend && npx http-server -p 8080
```

### 7. Run an epoch (submit Merkle root to chain)
```bash
node scripts/epoch-distributor.js
```

The dashboard at `http://localhost:8080` will now show **live on-chain stats** and the **Register Node** / **Claim Reward** buttons will fire real testnet transactions.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by **Cyberteck Labs** for the BNB Chain ecosystem. 🏆
