// src/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const PORT = 5001; // Use a different port than your Express REST API

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow your frontend to connect
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (adjust in production)
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('playCard', (data) => {
    const { roomId, move } = data;
    io.to(roomId).emit('movePlayed', move);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});