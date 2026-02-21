const { ethers } = require('ethers');
const MerkleTree = require('merkletreejs').MerkleTree;
const keccak256 = require('keccak256');
const fs = require('fs');

// Connect to opBNB Testnet or localhost depending on environment
const provider = new ethers.JsonRpcProvider('https://opbnb-testnet-rpc.bnbchain.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

// You will need to replace this with your deployed RewardVault address
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_REWARD_VAULT || '0x0000000000000000000000000000000000000000';

const vault = new ethers.Contract(VAULT_ADDRESS, [
    'function submitEpochRoot(bytes32) external',
    'event EpochSubmitted(uint256 indexed,bytes32)'
], wallet);

async function distributeEpoch() {
    console.log('Generating Epoch Merkle Tree data...');

    // Replace with actual worker reward data from your DB/Analytics
    const rewards = [
        { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', usdc: ethers.parseUnits('10.0', 6) },
        { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', usdc: ethers.parseUnits('3.2', 6) }
    ];

    // Create leaves: keccak256(abi.encodePacked(address, amount))
    const leaves = rewards.map(({ address, usdc }) =>
        ethers.solidityPackedKeccak256(['address', 'uint256'], [address, usdc])
    );

    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    console.log('Submitting epoch root:', root);

    try {
        const tx = await vault.submitEpochRoot(root);
        await tx.wait();
        console.log('✅ Epoch submitted to RewardVault:', tx.hash);
    } catch (err) {
        console.log('⚠️ Could not submit transaction (did you replace VAULT_ADDRESS and add testnet BNB?):', err.message);
    }

    // Save proofs for workers to claim
    const proofData = {};
    rewards.forEach((reward, i) => {
        proofData[reward.address] = {
            amount: reward.usdc.toString(),
            proof: tree.getHexProof(leaves[i])
        };
    });

    fs.writeFileSync('./epoch-proofs.json', JSON.stringify(proofData, null, 2));
    console.log('✅ Saved worker proofs to epoch-proofs.json');
}

distributeEpoch().catch(console.error);
