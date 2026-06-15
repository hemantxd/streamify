import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

let io;

const userSocketMap = new Map(); // userId -> Set<socketId>

export function initializeSocket(app) {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    socket.join(userId);
    io.emit('user:online', { userId });

    socket.on('chat:join', ({ friendId }) => {
      const room = getChatRoom(userId, friendId);
      socket.join(room);
    });

    socket.on('chat:typing', ({ friendId, isTyping }) => {
      socket.to(friendId).emit('chat:typing', { userId, isTyping });
    });

    socket.on('chat:read', async ({ friendId }) => {
      try {
        await Message.updateMany(
          { sender: friendId, receiver: userId, read: false },
          { read: true }
        );
      } catch {}
    });

    socket.on('disconnect', () => {
      const sockets = userSocketMap.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(userId);
          io.emit('user:offline', { userId });
        }
      }
    });
  });

  return server;
}

function getChatRoom(userId1, userId2) {
  return [userId1, userId2].sort().join(':');
}

export function emitNewMessage(message) {
  if (!io) return;

  const senderId = message.sender._id?.toString() || message.sender.toString();
  const receiverId = message.receiver._id?.toString() || message.receiver.toString();

  // Emit to each user's personal room only — every user always joins their own room on connect.
  // This avoids duplicates (shared room + personal room) and guarantees delivery
  // even if the receiver doesn't have the chat window open.
  io.to(senderId).emit('chat:message', message);
  io.to(receiverId).emit('chat:message', message);
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function getOnlineUsers() {
  return Array.from(userSocketMap.keys());
}