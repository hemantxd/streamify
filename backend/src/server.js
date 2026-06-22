import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import communityRoutes from './routes/community.route.js';
import friendRoutes from './routes/friend.route.js';
import notificationRoutes from './routes/notification.route.js';
import messageRoutes from './routes/message.route.js';
import uploadRoutes from './routes/upload.route.js';
import connectDB from './lib/db.js';
import { initializeSocket } from './lib/socket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

const server = initializeSocket(app);

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
