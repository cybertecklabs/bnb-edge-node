const { ethers } = require("ethers");

(async () => {
    try {
        const walletKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const wallet = new ethers.Wallet(walletKey);
        const address = wallet.address;
        const API_URL = 'http://127.0.0.1:3001/api';

        const res1 = await fetch(`${API_URL}/auth/nonce?address=${address}`);
        const data1 = await res1.json();
        
        const signature = await wallet.signMessage(data1.message);
        
        const res2 = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: data1.message, signature })
        });
        
        const data2 = await res2.json();
        const token = data2.token;
        
        console.log("Got token");

        const res3 = await fetch(`${API_URL}/agent/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Agent Status:", await res3.json());
    } catch(e) {
        console.error(e);
    }
})();
