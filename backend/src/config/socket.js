/**
 * socket.js — Socket.IO setup (stub — ready for real-time features).
 * Pass the HTTP server instance to initialize.
 */

let io = null;

const initSocket = (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174'],
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized. Call initSocket(server) first.');
    return io;
};

module.exports = { initSocket, getIO };
