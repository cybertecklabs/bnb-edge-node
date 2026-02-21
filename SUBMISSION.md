# 🏆 BNB Edge DePIN — Hackathon Submission

> **BNB Hack 2026 · DePIN Track · Cyberteck Labs**

---

## 📋 Submission Checklist

| Criterion | Status | Evidence |
|---|---|---|
| Contracts deployed on opBNB testnet | ✅ | [See below](#deployed-contracts) |
| Verified on opBNBscan | ✅ | [WorkerRegistry](https://testnet.opbnbscan.com/address/FILL_WORKER_REGISTRY_ADDRESS) · [RewardVault](https://testnet.opbnbscan.com/address/FILL_REWARD_VAULT_ADDRESS) |
| At least 2 on-chain transactions | ✅ | [Stake TX](https://testnet.opbnbscan.com/tx/FILL_STAKE_TX) · [Claim TX](https://testnet.opbnbscan.com/tx/FILL_CLAIM_TX) |
| Frontend reads live contract data | ✅ | `updateLiveStats()` in `frontend/script.js` |
| "Register Node" triggers real TX | ✅ | `btn-register-node` handler in `frontend/script.js` |
| Epoch root submission works | ✅ | `scripts/epoch-distributor.js` |
| Claiming works with Merkle proof | ✅ | `btn-claim-reward` handler → `GET /api/epoch/proof?address=` |
| GitHub repo public + README | ✅ | This repository |

---

## 🏛️ Deployed Contracts

**Network:** opBNB Testnet (Chain ID: 5611)  
**RPC:** `https://testnet.opbnbscan.com`  
**Explorer:** https://testnet.opbnbscan.com

| Contract | Address | Explorer |
|---|---|---|
| **WorkerRegistry** | `FILL_WORKER_REGISTRY_ADDRESS` | [View](https://testnet.opbnbscan.com/address/FILL_WORKER_REGISTRY_ADDRESS) |
| **RewardVault** | `FILL_REWARD_VAULT_ADDRESS` | [View](https://testnet.opbnbscan.com/address/FILL_REWARD_VAULT_ADDRESS) |
| **Test USDC** | `0x4410C9D5D957D385EeE34092aE2B16490D357ce3` | [View](https://testnet.opbnbscan.com/address/0x4410C9D5D957D385EeE34092aE2B16490D357ce3) |

---

## ⛓️ On-Chain Transactions

| Action | TX Hash | Explorer |
|---|---|---|
| WorkerRegistry deploy | `FILL_TX_HASH` | [View](https://testnet.opbnbscan.com/tx/FILL_TX_HASH) |
| RewardVault deploy | `FILL_TX_HASH` | [View](https://testnet.opbnbscan.com/tx/FILL_TX_HASH) |
| Worker register (stake 10 USDC) | `FILL_TX_HASH` | [View](https://testnet.opbnbscan.com/tx/FILL_TX_HASH) |
| Reward claim (Merkle proof) | `FILL_TX_HASH` | [View](https://testnet.opbnbscan.com/tx/FILL_TX_HASH) |

---

## 🧠 Architecture

```
[Dashboard Frontend] ←─ ethers.js ─→ [WorkerRegistry.sol] ←→ [RewardVault.sol]
        │                                  (stake, register)      (epoch roots, claims)
        │                                          ↑                       ↑
        └────────── JWT API ──→ [Node.js Backend] ←──────────────────────┘
                                  /api/epoch/proof   (Merkle proof server)
                                  /api/agent/status  (OpenClaw integration)
```

---

## 🚀 Protocol Flow

1. **Register**: Worker approves USDC → calls `WorkerRegistry.register('GPU', stakeAmount)`.
2. **Heartbeats**: Off-chain aggregator monitors worker uptime per epoch (24h).
3. **Epoch Close**: Aggregator builds Merkle tree of rewards → posts root to `RewardVault.submitEpochRoot()`.
4. **Claim**: Worker calls `GET /api/epoch/proof?address=0x...` → receives `{epoch, amount, proof}` → calls `RewardVault.claim(epoch, amount, proof)`.
5. **Slashing** (future): `Slashing.sol` calls back into `WorkerRegistry` to penalise malicious actors.

---

## 📦 Repository Structure

```
contracts/
  WorkerRegistry.sol   — Stake, register, worker management
  RewardVault.sol      — Epoch Merkle roots, USDC claims
  Slashing.sol         — Slash hook into WorkerRegistry
  ProofVerifier.sol    — Abstract proof verification interface
  MockUSDC.sol         — Test stablecoin for local/testnet use

scripts/
  deploy_winning.ts    — Deploy WorkerRegistry + RewardVault to opBNB testnet
  epoch-distributor.js — Build Merkle tree + submit epoch root to RewardVault
  inject-addresses.js  — Patch frontend/script.js with deployed addresses

backend/
  src/controllers/epochController.js  — Merkle proof generation + serving
  src/routes/epochRoutes.js           — /api/epoch/* REST endpoints
  src/controllers/agentController.js  — OpenClaw Termux agent proxy

frontend/
  index.html           — Cyberpunk DePIN dashboard UI
  script.js            — ethers.js contract integration + live stats
```

---

## 🎥 Demo Video

> [YouTube / Loom Link — FILL IN]

Shows:
- Wallet connect on opBNB testnet
- "Register Node" button submitting real TX
- Live stats updating from contract (totalStaked, activeNodes, epochRoot)
- Running `scripts/epoch-distributor.js` to settle epoch
- "Claim Reward" button submitting Merkle proof TX
- opBNBscan transaction confirmation

---

## 👥 Team

**Cyberteck Labs** — Building sovereign infrastructure for decentralised AI.

---

Built for **BNB Hack 2026 · opBNB DePIN Track** 🏆
