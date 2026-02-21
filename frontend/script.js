const API_URL = 'http://localhost:3001/api';
let token = localStorage.getItem('depin_token') || null;
const walletKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // standard test wallet private key locally available

async function connectWallet() {
    try {
        const wallet = new ethers.Wallet(walletKey);
        const address = wallet.address;

        // 1. Get Nonce
        const res1 = await fetch(`${API_URL}/auth/nonce?address=${address}`);
        const { nonce, message } = await res1.json();

        // 2. Sign message
        const signature = await wallet.signMessage(message);

        // 3. Verify and get token
        const res2 = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, signature })
        });

        if (res2.ok) {
            const data = await res2.json();
            token = data.token;
            localStorage.setItem('depin_token', token);
            document.querySelector('.wallet-addr').textContent = data.user.address.slice(0, 6) + '…' + data.user.address.slice(-4);
            loadDashboard();
            checkAgentStatus();
        } else {
            console.error('Verify failed', await res2.text());
            alert('Login failed');
        }
    } catch (e) {
        console.error('Wallet connect error:', e);
    }
}

document.querySelector('.btn-primary').addEventListener('click', connectWallet);

async function loadDashboard() {
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/farm/profiles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profiles = await res.json();
        const farmGrid = document.querySelector('.farm-grid');
        farmGrid.innerHTML = ''; // clear mock

        if (profiles.length === 0) {
            farmGrid.innerHTML = '<div>No profiles found</div>';
        }

        profiles.forEach(p => {
            const div = document.createElement('div');
            div.className = 'profile-card';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <span class="status-badge ${p.status === 'active' ? 'status-active' : 'status-paused'}">${p.status.toUpperCase()}</span>
                    <span>$${(p.earningsUSD || 0).toFixed(2)}</span>
                </div>
                <h3>${p.name}</h3>
                <div style="font-size:12px; color:var(--mid); margin-bottom:10px;">${p.projects.join(', ')}</div>
                <button class="btn-farm" style="color:${p.status === 'active' ? 'var(--red)' : 'var(--green)'};" onclick="toggleProfile('${p.id}', '${p.status}')">
                    ${p.status === 'active' ? 'Stop' : 'Launch'}
                </button>
            `;
            farmGrid.appendChild(div);
        });
    } catch (e) {
        console.error('Failed to load dashboard', e);
    }
}

async function toggleProfile(id, currentStatus) {
    const action = currentStatus === 'active' ? 'stop' : 'launch';
    try {
        const res = await fetch(`${API_URL}/farm/profiles/${id}/${action}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            loadDashboard();
        }
    } catch (e) {
        console.error(e);
    }
}

// Initial load attempt if already got token
if (token) {
    loadDashboard();
    checkAgentStatus();
}

async function checkAgentStatus() {
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/agent/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const lbl = document.getElementById('agent-status-label');
        const frame = document.getElementById('agent-iframe');

        if (data.status === 'online') {
            lbl.style.color = "var(--green)";
            lbl.textContent = "ONLINE & CONNECTED";
            frame.src = data.url; // Load local agent UI internally
        } else {
            lbl.style.color = "var(--red)";
            lbl.textContent = "OFFLINE (TERMUX NODES REQUIRED)";
            frame.src = "about:blank";
        }
    } catch (e) {
        console.error("Agent status error", e);
    }
}

// ============================================
// OPBNB TESTNET SMART CONTRACT INTEGRATION
// ============================================

const testnetProvider = new ethers.JsonRpcProvider("https://opbnb-testnet-rpc.bnbchain.org");

// Deployed Addresses (Replace with your own if you deploy locally or on testnet)
const CONTRACTS = {
    WorkerRegistry: "0xYourDeployedRegistryAddress",
    RewardVault: "0xYourDeployedVaultAddress",
    USDC: "0x4410C9D5D957D385EeE34092aE2B16490D357ce3"
};

const WorkerRegistryABI = [
    "function register(string calldata _capability, uint256 _stakeAmount) external",
    "function totalStaked() external view returns (uint256)",
    "function getWorkers() external view returns (tuple(address wallet, string capability, uint256 stake, uint256 reputation, bool active)[])"
];

const RewardVaultABI = [
    "function claim(uint256 epoch, uint256 _amount, bytes32[] calldata _proof) external",
    "function currentRoot() external view returns (bytes32)"
];

const MockUSDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function mint(address to, uint256 amount) external"
];

const registryContract = new ethers.Contract(CONTRACTS.WorkerRegistry, WorkerRegistryABI, testnetProvider);
const vaultContract = new ethers.Contract(CONTRACTS.RewardVault, RewardVaultABI, testnetProvider);

async function updateLiveStats() {
    try {
        const totalStaked = await registryContract.totalStaked();
        const workers = await registryContract.getWorkers();
        const currentRoot = await vaultContract.currentRoot();

        document.getElementById('val-total-staked').innerText = `${ethers.formatUnits(totalStaked, 6)} USDC`;
        document.getElementById('val-active-nodes').innerText = `${workers.length}`;
        document.getElementById('val-epoch-root').innerText = currentRoot.substring(0, 10) + '...';
        document.getElementById('val-epoch-root').title = currentRoot;
    } catch (err) {
        console.warn("Could not fetch live stats — Ensure Contracts are deployed.", err.message);
    }
}

// Call on startup
updateLiveStats();
setInterval(updateLiveStats, 10000); // Check every 10s

document.getElementById('btn-register-node')?.addEventListener('click', async () => {
    try {
        const wallet = new ethers.Wallet(walletKey, testnetProvider);
        const usdc = new ethers.Contract(CONTRACTS.USDC, MockUSDC_ABI, wallet);
        const registry = new ethers.Contract(CONTRACTS.WorkerRegistry, WorkerRegistryABI, wallet);

        document.getElementById('btn-register-node').textContent = 'Approving USDC...';
        let tx = await usdc.approve(CONTRACTS.WorkerRegistry, ethers.parseUnits('10', 6));
        await tx.wait();

        document.getElementById('btn-register-node').textContent = 'Registering...';
        tx = await registry.register('GPU', ethers.parseUnits('10', 6));
        await tx.wait();

        document.getElementById('btn-register-node').textContent = 'Node Registered ✅';
        document.getElementById('btn-register-node').style.background = 'var(--green)';
        console.log(`Node registered! tx: https://testnet.opbnbscan.com/tx/${tx.hash}`);
        updateLiveStats();
    } catch (e) {
        console.error('Register Error:', e);
        document.getElementById('btn-register-node').textContent = 'Failed — See Console';
        document.getElementById('btn-register-node').style.background = 'var(--red)';
    }
});

document.getElementById('btn-claim-reward')?.addEventListener('click', async () => {
    try {
        const wallet = new ethers.Wallet(walletKey, testnetProvider);

        document.getElementById('btn-claim-reward').textContent = 'Fetching Proof...';

        // Fetch worker's proof from our backend by their wallet address
        const proofRes = await fetch(`${API_URL}/epoch/proof?address=${wallet.address}`);
        if (!proofRes.ok) throw new Error('No proof available for this address. Run the epoch distributor first.');
        const { epoch, amount, proof } = await proofRes.json();

        const vault = new ethers.Contract(CONTRACTS.RewardVault, RewardVaultABI, wallet);

        document.getElementById('btn-claim-reward').textContent = 'Claiming...';
        const tx = await vault.claim(epoch, amount, proof);
        await tx.wait();

        document.getElementById('btn-claim-reward').textContent = 'Claimed ✅';
        document.getElementById('btn-claim-reward').style.background = 'var(--cyan)';
        console.log(`Rewards Claimed! tx: https://testnet.opbnbscan.com/tx/${tx.hash}`);
    } catch (e) {
        console.error('Claim Error:', e);
        document.getElementById('btn-claim-reward').textContent = 'Claim Failed — See Console';
        document.getElementById('btn-claim-reward').style.background = 'var(--red)';
    }
});
