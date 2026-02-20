import { ethers } from 'ethers';
import logger from '../utils/logger.js';

const OPBNB_RPC = process.env.OPBNB_RPC || 'https://opbnb-mainnet-rpc.bnbchain.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';
const NODE_REGISTRY_ADDRESS = process.env.NODE_REGISTRY_ADDRESS || '0x4981E2a2f8B726b2d1E6f00A8b9Cad0e1f2031';

const provider = new ethers.JsonRpcProvider(OPBNB_RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const nodeRegistryABI = [
    {
        "inputs": [{ "internalType": "string", "name": "nodeType", "type": "string" }],
        "name": "registerNode",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "nodes",
        "outputs": [
            { "internalType": "string", "name": "nodeType", "type": "string" },
            { "internalType": "uint256", "name": "stake", "type": "uint256" },
            { "internalType": "uint256", "name": "repScore", "type": "uint256" },
            { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const nodeRegistry = new ethers.Contract(NODE_REGISTRY_ADDRESS, nodeRegistryABI, wallet);

export const registerNode = async (nodeType: string) => {
    try {
        const tx = await nodeRegistry.registerNode(nodeType, { value: ethers.parseEther('0.01'), gasLimit: 500000 });
        await tx.wait();
        logger.info(`Node registered: ${tx.hash}`);
        return tx.hash;
    } catch (err: any) {
        logger.error('Register node failed', err);
        throw err;
    }
};

export const getNodeInfo = async (address: string) => {
    try {
        const info = await nodeRegistry.nodes(address);
        return info;
    } catch (err: any) {
        logger.error('Get node info failed', err);
        throw err;
    }
};
