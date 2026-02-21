const winston = require('winston');
const { combine, timestamp, printf, colorize, errors } = winston.format;

const fmt = printf(({ level, message, timestamp, stack }) =>
    `${timestamp} [${level}]: ${stack || message}`
);

module.exports = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), fmt),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});
