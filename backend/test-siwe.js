const { ethers } = require("ethers");
const { SiweMessage } = require("siwe");

(async () => {
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    const address = wallet.address;
    
    const message = new SiweMessage({
        domain: 'localhost',
        address,
        statement: 'Sign in to BNB Edge DePIN OS',
        uri: 'http://localhost:3000',
        version: '1',
        chainId: 204,
        nonce: '1234567812345678',
    }).prepareMessage();
    
    const signature = await wallet.signMessage(message);
    console.log("Sig:", signature);
    
    const siweMessage = new SiweMessage(message);
    try {
        const {data} = await siweMessage.verify({ signature });
        console.log("Verified:", data.address === address);
    } catch(err) {
        console.error("Siwe fail:", err.message);
    }
})();
