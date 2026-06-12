import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

    // Track online users
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    // Join personal room for private messages
    socket.join(userId);

    // Broadcast online status
    io.emit('user:online', { userId });

    // Handle joining chat with a friend
    socket.on('chat:join', ({ friendId }) => {
      const room = getChatRoom(userId, friendId);
      socket.join(room);
    });

    // Handle sending message
    socket.on('chat:send', async ({ receiverId, text }) => {
      try {
        const { Message } = await import('../models/Message.js');
        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          text,
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'fullName profilePicture')
          .populate('receiver', 'fullName profilePicture');

        const room = getChatRoom(userId, receiverId);
        io.to(room).emit('chat:message', populated);
      } catch (err) {
        console.error('chat:send error:', err.message);
      }
    });

    // Handle typing indicator
    socket.on('chat:typing', ({ friendId, isTyping }) => {
      const room = getChatRoom(userId, friendId);
      socket.to(room).emit('chat:typing', { userId, isTyping });
    });

    // Handle marking messages as read
    socket.on('chat:read', async ({ friendId }) => {
      try {
        const { Message } = await import('../models/Message.js');
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

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function getOnlineUsers() {
  return Array.from(userSocketMap.keys());
}