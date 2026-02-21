const { ethers } = require('ethers');
const logger = require('../utils/logger');

let provider, wallet, nodeRegistry;

const NODE_REGISTRY_ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    {
        "anonymous": false, "name": "NodeRegistered", "type": "event",
        "inputs": [
            { "indexed": true, "name": "node", "type": "address" },
            { "indexed": false, "name": "nodeType", "type": "string" },
            { "indexed": false, "name": "stake", "type": "uint256" }
        ]
    },
    {
        "anonymous": false, "name": "StakeIncreased", "type": "event",
        "inputs": [
            { "indexed": true, "name": "node", "type": "address" },
            { "indexed": false, "name": "additional", "type": "uint256" }
        ]
    },
    {
        "anonymous": false, "name": "StakeSlashed", "type": "event",
        "inputs": [
            { "indexed": true, "name": "node", "type": "address" },
            { "indexed": false, "name": "amount", "type": "uint256" },
            { "indexed": false, "name": "reason", "type": "string" }
        ]
    },
    {
        "anonymous": false, "name": "NodeDeregistered", "type": "event",
        "inputs": [
            { "indexed": true, "name": "node", "type": "address" },
            { "indexed": false, "name": "refund", "type": "uint256" }
        ]
    },
    {
        "name": "nodes", "type": "function", "stateMutability": "view",
        "inputs": [{ "name": "", "type": "address" }],
        "outputs": [
            { "name": "owner", "type": "address" },
            { "name": "nodeType", "type": "string" },
            { "name": "stake", "type": "uint256" },
            { "name": "repScore", "type": "uint256" },
            { "name": "active", "type": "bool" }
        ]
    },
    {
        "name": "registerNode", "type": "function", "stateMutability": "payable",
        "inputs": [{ "name": "nodeType", "type": "string" }], "outputs": []
    },
    {
        "name": "increaseStake", "type": "function", "stateMutability": "payable",
        "inputs": [], "outputs": []
    },
    {
        "name": "slashNode", "type": "function", "stateMutability": "nonpayable",
        "inputs": [
            { "name": "node", "type": "address" },
            { "name": "amount", "type": "uint256" },
            { "name": "reason", "type": "string" }
        ], "outputs": []
    },
    {
        "name": "deregisterNode", "type": "function", "stateMutability": "nonpayable",
        "inputs": [], "outputs": []
    },
    {
        "name": "updateRepScore", "type": "function", "stateMutability": "nonpayable",
        "inputs": [
            { "name": "node", "type": "address" },
            { "name": "newScore", "type": "uint256" }
        ], "outputs": []
    },
    {
        "name": "minStake", "type": "function", "stateMutability": "view",
        "inputs": [], "outputs": [{ "name": "", "type": "uint256" }]
    },
    {
        "name": "owner", "type": "function", "stateMutability": "view",
        "inputs": [], "outputs": [{ "name": "", "type": "address" }]
    }
];

function getContracts() {
    if (!provider) {
        provider = new ethers.JsonRpcProvider(process.env.OPBNB_RPC);
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        nodeRegistry = new ethers.Contract(
            process.env.NODE_REGISTRY_ADDRESS,
            NODE_REGISTRY_ABI,
            wallet
        );
    }
    return { provider, wallet, nodeRegistry };
}

exports.registerNode = async (nodeType) => {
    const { nodeRegistry } = getContracts();
    const minStake = await nodeRegistry.minStake();
    const tx = await nodeRegistry.registerNode(nodeType, { value: minStake });
    await tx.wait();
    logger.info(`registerNode tx: ${tx.hash}`);
    return tx.hash;
};

exports.increaseStake = async (amountEth) => {
    const { nodeRegistry } = getContracts();
    const tx = await nodeRegistry.increaseStake({ value: ethers.parseEther(String(amountEth)) });
    await tx.wait();
    return tx.hash;
};

exports.getNodeInfo = async (address) => {
    const { nodeRegistry } = getContracts();
    return await nodeRegistry.nodes(address);
};

exports.slashNode = async (nodeAddress, amountEth, reason) => {
    const { nodeRegistry } = getContracts();
    const tx = await nodeRegistry.slashNode(nodeAddress, ethers.parseEther(String(amountEth)), reason);
    await tx.wait();
    return tx.hash;
};

exports.deregisterNode = async () => {
    const { nodeRegistry } = getContracts();
    const tx = await nodeRegistry.deregisterNode();
    await tx.wait();
    return tx.hash;
};

exports.getProvider = () => getContracts().provider;
exports.NODE_REGISTRY_ABI = NODE_REGISTRY_ABI;
