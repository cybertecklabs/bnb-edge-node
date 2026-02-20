import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import * as eventListener from './services/eventListener.js';
import jwt from 'jsonwebtoken';
import logger from './utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Socket auth
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (socket as any).user = decoded;
        next();
    } catch (err: any) {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket: any) => {
    logger.info(`User connected via Socket: ${socket.user.address}`);
    socket.on('disconnect', () => logger.info(`User disconnected: ${socket.user.address}`));
});

// Attach io to app to use in controllers
app.set('io', io);

// Start blockchain event listener
eventListener.start(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    logger.info(`DePIN Farm OS API running on http://localhost:${PORT}`);
});
