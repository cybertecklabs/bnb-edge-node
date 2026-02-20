import { ethers } from 'ethers';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { Server } from 'socket.io';

const OPBNB_RPC = process.env.OPBNB_RPC || 'https://opbnb-mainnet-rpc.bnbchain.org';
const NODE_REGISTRY_ADDRESS = process.env.NODE_REGISTRY_ADDRESS || '0x4981E2a2f8B726b2d1E6f00A8b9Cad0e1f2031';

const provider = new ethers.JsonRpcProvider(OPBNB_RPC);
const nodeRegistryABI = [
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "node", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "nodeType", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "stake", "type": "uint256" }
        ],
        "name": "NodeRegistered",
        "type": "event"
    }
];

const nodeRegistry = new ethers.Contract(NODE_REGISTRY_ADDRESS, nodeRegistryABI, provider);

export const start = (io: Server) => {
    nodeRegistry.on('NodeRegistered', async (node: string, nodeType: string, stake: bigint) => {
        logger.info(`Node registered on-chain: ${node}`);
        const address = node.toLowerCase();

        try {
            let user = await prisma.user.findUnique({ where: { address } });
            if (!user) {
                user = await prisma.user.create({ data: { address, roles: JSON.stringify(['PROVIDER']) } });
            }

            await prisma.node.upsert({
                where: { address },
                update: { type: nodeType, stake: Number(ethers.formatEther(stake)), status: 'active' },
                create: {
                    address,
                    ownerId: user.id,
                    type: nodeType,
                    stake: Number(ethers.formatEther(stake)),
                    reputation: 50,
                    status: 'active',
                },
            });

            io.emit('nodeRegistered', { address, nodeType, stake: ethers.formatEther(stake) });
            io.emit('newActivity', {
                id: Date.now().toString(),
                type: 'node',
                title: 'Node Registered On-Chain',
                sub: `Node ${address.slice(0, 6)}...${address.slice(-4)} verified on opBNB.`,
                time: 'Just now'
            });
        } catch (err: any) {
            logger.error('Error in NodeRegistered event handler', err);
        }
    });

    logger.info('Blockchain event listener started');
};
