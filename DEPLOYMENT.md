# 🚀 BNB Edge DePIN Node — Deployment Guide

This guide details the steps to deploy the full BNB Edge stack to opBNB Mainnet and Vercel.

## 📋 Prerequisites

1.  **Wallet:** A deployer wallet with at least 0.5 BNB (opBNB) and 100 USDC (opBNB) for testing.
2.  **API Keys:**
    *   [Alchemy](https://www.alchemy.com/) or another opBNB RPC provider.
    *   [BscScan](https://bscscan.com/apis) API Key for contract verification.
    *   [Pinata](https://www.pinata.cloud/) API Key and Secret for IPFS.
    *   [Vercel](https://vercel.com/) account for frontend hosting.

---

## 🏗 Phase 1: Smart Contracts (opBNB)

1.  **Configure Environment:**
    Copy `.env.example` to `.env` and fill in your keys:
    ```bash
    PRIVATE_KEY=your_private_key
    BSCSCAN_API_KEY=your_bscscan_key
    ALCHEMY_OPBNB_KEY=your_alchemy_key
    ```

2.  **Install Dependencies & Compile:**
    ```bash
    npm install
    npx hardhat compile
    ```

3.  **Run Test Suite:**
    ```bash
    npx hardhat test
    ```

4.  **Deploy to Mainnet:**
    ```bash
    npm run deploy:main
    ```
    *This script will save addresses to `deployments.json` and `frontend/.env.local`.*

5.  **Verify Contracts:**
    ```bash
    npm run verify:main
    ```

---

## 🧠 Phase 2: AI Health Service (Python)

The AI service handles node reliability predictions and the keeper bot.

1.  **Local Setup:**
    ```bash
    cd ai-service
    pip install -r requirements.txt
    python main.py
    ```

2.  **Docker Deployment:**
    ```bash
    docker build -t bnb-edge-ai-service ./ai-service
    docker run -p 8000:8000 --env-file ai-service/.env bnb-edge-ai-service
    ```
    *Recommended: Deploy to AWS App Runner or Render.*

---

## 💻 Phase 3: Frontend (Next.js)

1.  **Configure Vercel:**
    Push your code to GitHub and connect it to Vercel.

2.  **Environment Variables:**
    Add the following to Vercel dashboard:
    *   `NEXT_PUBLIC_NODE_REGISTRY`: [From deployments.json]
    *   `NEXT_PUBLIC_JOB_MARKETPLACE`: [From deployments.json]
    *   `NEXT_PUBLIC_STORAGE_MANAGER`: [From deployments.json]
    *   `NEXT_PUBLIC_REPUTATION_ORACLE`: [From deployments.json]
    *   `NEXT_PUBLIC_USDC`: [From deployments.json]
    *   `NEXT_PUBLIC_PINATA_API_KEY`: [Your Key]
    *   `NEXT_PUBLIC_PINATA_SECRET_KEY`: [Your Secret]

3.  **Build & Deploy:**
    ```bash
    npm run build
    ```

---

## 📊 Phase 4: Data Indexing (The Graph)

1.  **Initialize Subgraph:**
    ```bash
    cd subgraph
    graph auth --product hosted-service <ACCESS_TOKEN>
    graph deploy --product hosted-service <USER>/bnb-edge-depin
    ```

---

## ✅ Post-Deployment Checklist

*   [ ] Verify `JobMarketplace` has `treasury` set to the correct fee-receiving address.
*   [ ] Ensure `ReputationOracle` address is set in `NodeRegistry`.
*   [ ] Test a small GPU job on Mainnet to verify the escrow flow.
*   [ ] Check if the AI Service is correctly reading the `NodeRegistry` events.

---

## 🛠 Troubleshooting

*   **Gas Issues:** opBNB uses very low gas. If transactions fail, ensure `gasPrice` is set to 1000000 (0.001 gwei) in `hardhat.config.ts`.
*   **Verification Failed:** If BSCScan fails to verify, ensure you have the correct compiler version (0.8.20) and optimizer settings (200 runs).
*   **IPFS Timeout:** Ensure your Pinata API keys have "pinFile" and "pinJSON" permissions.
