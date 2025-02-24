import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const PORT = 5001;

app.use(
  cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const users = new Map<string, string>();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    users.set(userId, socket.id);

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on('playCard', (data) => {
      const { roomId, move } = data;
      console.log(`User ${userId} played a card in room ${roomId}:`, move);
      io.to(roomId).emit('movePlayed', { ...move, userId });
    });

    // Event: User disconnects
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      users.delete(userId);
    });
  }
});

server.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});