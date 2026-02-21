const { ethers } = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const path = require('path');

// In-memory store for prototype — also persisted to epoch-proofs.json
const epochs = {};
const PROOFS_FILE = path.join(__dirname, '..', '..', '..', '..', 'epoch-proofs.json');

// Preload proofs file if it exists (written by scripts/epoch-distributor.js)
function loadProofsFile() {
    try {
        if (fs.existsSync(PROOFS_FILE)) {
            const data = JSON.parse(fs.readFileSync(PROOFS_FILE, 'utf8'));
            epochs['__file__'] = data;
        }
    } catch (e) {
        console.warn('Could not load epoch-proofs.json:', e.message);
    }
}
loadProofsFile();

exports.submitEpoch = async (req, res) => {
    try {
        const { epochId, workers } = req.body;
        if (!epochId || !workers || !Array.isArray(workers)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        // Calculate total rewards and prepare leaves
        let totalRewards = BigInt(0);
        const leaves = workers.map(w => {
            const rewardWei = ethers.parseUnits(w.reward.toString(), 6); // Assuming USDC with 6 decimals
            totalRewards += rewardWei;

            // abi.encode(address, uint256)
            return ethers.solidityPackedKeccak256(
                ['address', 'uint256'],
                [w.address, rewardWei]
            );
        });

        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const merkleRoot = tree.getHexRoot();

        // Generate proofs for each worker
        const workerProofs = workers.map((w, index) => {
            const leaf = leaves[index];
            const proof = tree.getHexProof(leaf);
            return {
                address: w.address,
                reward: `${w.reward} USDC`,
                proof: proof
            };
        });

        const epochData = {
            merkleRoot,
            totalRewards: `${ethers.formatUnits(totalRewards, 6)} USDC`,
            workers: workerProofs
        };

        epochs[epochId] = epochData;

        // In a real scenario, the backend would also call RewardVault.submitEpochRoot(epochId, merkleRoot, totalRewards)
        res.status(201).json({ message: 'Epoch submitted successfully', epochData });

    } catch (error) {
        console.error("Epoch Controller Error:", error);
        res.status(500).json({ error: 'Server error building epoch root' });
    }
};

exports.getEpochProof = async (req, res) => {
    try {
        const { id } = req.params;
        const epochData = epochs[id];

        if (!epochData) {
            return res.status(404).json({ error: 'Epoch not found' });
        }

        res.json(epochData);

    } catch (error) {
        console.error("Epoch Controller Error:", error);
        res.status(500).json({ error: 'Server error fetching epoch proof' });
    }
};

// GET /api/epoch/proof?address=0x...
// Returns the proof, raw amount (in USDC wei) and epochId for a specific worker
exports.getWorkerProof = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: 'address query param required' });
        const normalised = address.toLowerCase();

        // Check file-loaded proofs first (from epoch-distributor.js)
        loadProofsFile();
        if (epochs['__file__']) {
            const entry = Object.entries(epochs['__file__']).find(
                ([addr]) => addr.toLowerCase() === normalised
            );
            if (entry) {
                const [, data] = entry;
                return res.json({ epoch: 1, amount: data.amount, proof: data.proof });
            }
        }

        // Fallback: check runtime submitted epochs
        for (const [epochId, epochData] of Object.entries(epochs)) {
            if (epochId === '__file__') continue;
            const worker = epochData.workers?.find(w => w.address.toLowerCase() === normalised);
            if (worker) {
                return res.json({
                    epoch: parseInt(epochId),
                    amount: ethers.parseUnits(worker.reward.replace(' USDC', ''), 6).toString(),
                    proof: worker.proof
                });
            }
        }

        return res.status(404).json({ error: 'No proof found for this address' });
    } catch (error) {
        console.error("Epoch Worker Proof Error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};
