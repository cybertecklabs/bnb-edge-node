const { SiweMessage } = require('siwe');

async function verifySiweSignature(message, signature) {
    try {
        const siweMessage = new SiweMessage(message);
        const { data } = await siweMessage.verify({ signature });
        return data;
    } catch (err) {
        throw new Error(`Invalid SIWE signature: ${err.message}`);
    }
}

function buildSiweMessage({ address, nonce, chainId = 204 }) {
    return new SiweMessage({
        domain: process.env.SIWE_DOMAIN || 'localhost',
        address,
        statement: 'Sign in to BNB Edge DePIN OS',
        uri: process.env.SIWE_URI || 'http://localhost:3000',
        version: '1',
        chainId,
        nonce,
    }).prepareMessage();
}

module.exports = { verifySiweSignature, buildSiweMessage };
