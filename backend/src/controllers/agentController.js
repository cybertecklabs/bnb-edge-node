const logger = require('../utils/logger');

exports.getStatus = async (req, res) => {
    try {
        const url = process.env.OPENCLAW_URL || 'http://127.0.0.1:18789';

        let isOnline = false;
        try {
            const hcRes = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1500) });
            isOnline = hcRes.ok;
        } catch (e) {
            try {
                const rootRes = await fetch(url, { signal: AbortSignal.timeout(1500) });
                isOnline = rootRes.ok;
            } catch (e2) {
                isOnline = false;
            }
        }

        if (isOnline) {
            return res.json({ status: 'online', url });
        } else {
            return res.json({ status: 'offline', message: 'OpenClaw Agent unreachable on Termux.' });
        }
    } catch (err) {
        logger.error("Agent status check failed:", err.message);
        return res.status(500).json({ error: 'Failed to reach agent' });
    }
};

exports.sendCommand = async (req, res) => {
    try {
        const { command } = req.body;
        const url = process.env.OPENCLAW_URL || 'http://127.0.0.1:18789';
        const token = process.env.OPENCLAW_TOKEN;

        // Note: Assuming a generic chat/proxy API for OpenClaw. 
        // Actual implementation depends on OpenClaw's exact exposed REST format.
        const cRes = await fetch(`${url}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: command })
        });

        if (!cRes.ok) {
            return res.status(cRes.status).json({ error: 'Agent returned an error' });
        }

        const data = await cRes.json();
        res.json({ reply: data });

    } catch (err) {
        logger.error("Agent command failed:", err.message);
        res.status(500).json({ error: 'Failed to communicate with OpenClaw' });
    }
};
