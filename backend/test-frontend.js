const { ethers } = require("ethers");

(async () => {
    try {
        const walletKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const wallet = new ethers.Wallet(walletKey);
        const address = wallet.address;
        console.log("Wallet address:", address);

        const API_URL = 'http://127.0.0.1:3001/api';

        // 1. Get Nonce
        const res1 = await fetch(`${API_URL}/auth/nonce?address=${address}`);
        const data1 = await res1.json();
        console.log("Nonce res:", data1);
        if (!data1.nonce) return;

        // 2. Sign message
        const signature = await wallet.signMessage(data1.message);

        // 3. Verify
        const res2 = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: data1.message, signature })
        });

        const data2 = await res2.json();
        console.log("Verify res:", data2);

        if (data2.token) {
            const res3 = await fetch(`${API_URL}/farm/profiles`, {
                headers: { 'Authorization': `Bearer ${data2.token}` }
            });
            console.log("Profiles res:", await res3.json());
        }
    } catch (e) {
        console.error(e);
    }
})();
