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

### 5. Reverse Auction Engine & AWS Cost Comparator
Nodes bid down prices in real-time, often reaching 70-80% savings compared to AWS/GCP.

---

## 🛠️ Technology Stack

- **Blockchain**: opBNB, Solidity 0.8.24
- **Contracts**: Hardhat, Ethers.js, OpenZeppelin v5
- **Frontend**: Next.js 14, Tailwind CSS, RainbowKit, Wagmi v2
- **Data Indexing**: The Graph
- **AI Service**: FastAPI, WebSockets, Web3.py

---

## 🌐 Frontend Dashboard: Command Center v2

The BNB Edge interface has been completely rebuilt for the hackathon to provide a **sci-fi, mission-critical experience** for DePIN operators.

**Live Demo**: [https://bnb-edge-dashboard.vercel.app](https://bnb-edge-dashboard.vercel.app)
**Video Tour**: [YouTube Link](https://youtube.com/...)

### 📸 Dashboard Showcase

> *Screenshots of the Command Dashboard, Nodes Library, and Analytics Page*

### Key Features
- **Real-Time Monitoring**: Live Websocket feeds for uptime, bandwidth, and earnings.
- **Atmospheric UI**: Glassmorphism, animated scanlines, and reactive "BNB Yellow" branding.
- **Node Management**: Sortable registry with reputation bars and health status.
- **Visual Analytics**: Interactive maps, network capacity growth, and tokenomics.
- **Job Queue**: Live feed of compute tasks with progress bars and status indicators.
- **Build Logs**: Terminal-style view of node operations in real-time.
- **AI Health Monitor**: Predictive uptime scoring with automated alerting.

### 📦 Quick Start (Deploy in 10 Minutes)

### Installation
```bash
npm install
cd frontend && npm install
```

### Configuration
Copy `.env.example` to `.env` and fill in your `PRIVATE_KEY` and RPC URLs.

### Deployment
```bash
# Deploy to opBNB Testnet
npx hardhat run scripts/deploy.ts --network opbnbTestnet
```

### Run Frontend
The frontend is a self-contained static HTML dashboard.
```bash
# Open the dashboard directly in your browser
open frontend/index.html
```
No installation or dev server is required for the demo dashboard.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the BNB EdgeGrid team for the BNB Chain ecosystem.
