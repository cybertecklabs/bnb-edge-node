import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const ALCHEMY_OPBNB_KEY = process.env.ALCHEMY_OPBNB_KEY || "";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris" },
    },
    networks: {
        hardhat: {},
        opbnbTestnet: {
            url: ALCHEMY_OPBNB_KEY ? `https://opbnb-testnet.g.alchemy.com/v2/${ALCHEMY_OPBNB_KEY}` : "https://opbnb-testnet-rpc.bnbchain.org",
            chainId: 5611, accounts: [PRIVATE_KEY], gasPrice: 1000000,
        },
        opbnbMainnet: {
            url: ALCHEMY_OPBNB_KEY ? `https://opbnb-mainnet.g.alchemy.com/v2/${ALCHEMY_OPBNB_KEY}` : "https://opbnb-mainnet-rpc.bnbchain.org",
            chainId: 204, accounts: [PRIVATE_KEY], gasPrice: 1000000,
        },
        bscMainnet: { url: "https://bsc-dataseed1.binance.org/", chainId: 56, accounts: [PRIVATE_KEY] },
    },
    etherscan: {
        apiKey: { opbnbMainnet: BSCSCAN_API_KEY, opbnbTestnet: BSCSCAN_API_KEY },
        customChains: [
            { network: "opbnbMainnet", chainId: 204, urls: { apiURL: "https://api-opbnb.bscscan.com/api", browserURL: "https://opbnbscan.com" } },
            { network: "opbnbTestnet", chainId: 5611, urls: { apiURL: "https://api-opbnb-testnet.bscscan.com/api", browserURL: "https://testnet.opbnbscan.com" } },
        ],
    },
    gasReporter: { enabled: process.env.REPORT_GAS === "true", currency: "USD" },
    typechain: {
        outDir: "typechain-types",
        target: "ethers-v6",
    },
};

export default config;
