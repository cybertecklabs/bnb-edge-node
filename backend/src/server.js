require('dotenv').config();
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const { start: startListener } = require('./services/eventListener');
const logger = require('./utils/logger');

const server = http.createServer(app);

const io = new SocketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
    },
});

// Socket authentication
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    const addr = socket.user?.address || 'unknown';
    logger.info(`WS connected: ${addr}`);
    socket.join(`user:${socket.user.id}`);

    socket.on('subscribe:node', (nodeId) => socket.join(`node:${nodeId}`));
    socket.on('disconnect', () => logger.info(`WS disconnected: ${addr}`));
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Start on-chain event listener
if (process.env.NODE_REGISTRY_ADDRESS && process.env.OPBNB_RPC && process.env.PRIVATE_KEY) {
    startListener(io);
} else {
    logger.warn('Skipping event listener — blockchain env vars not set');
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`));

module.exports = server; // for tests
