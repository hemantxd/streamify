import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from '../api/axios';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socketRef = useRef(null);

  // Fetch conversations data
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get('/friends');
      const convs = data.friends.map((f) => ({
        friend: f,
        lastMessage: null,
        unread: 0,
      }));
      setConversations(convs);
    } catch {
      /* empty */
    }
  }, [user]);

  // Fetch last messages for each conversation
  const fetchLastMessages = useCallback(async () => {
    if (!user || conversations.length === 0) return;
    try {
      const { data } = await axios.get('/messages/conversations');
      if (data.conversations) {
        // Merge with existing conversation data
        setConversations((prev) => {
          const merged = [...prev];
          data.conversations.forEach((conv) => {
            const idx = merged.findIndex((c) => c.friend._id === conv.friend._id);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], lastMessage: conv.lastMessage, unread: conv.unread };
            } else if (conv.friend) {
              merged.push(conv);
            }
          });
          return merged;
        });

        // Update unread counts
        const counts = {};
        data.conversations.forEach((c) => {
          if (c.friend) counts[c.friend._id] = c.unread || 0;
        });
        setUnreadCounts(counts);
      }
    } catch {
      /* empty */
    }
  }, [user]);

  // Get a token — from localStorage if available, or fetch from backend
  const getToken = useCallback(async () => {
    let token = localStorage.getItem('jwt_token');
    if (token) return token;
    try {
      const { data } = await axios.get('/auth/token');
      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
        return data.token;
      }
    } catch { /* empty */ }
    return null;
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    fetchConversations();

    let active = true;

    const initSocket = async () => {
      const token = await getToken();
      if (!token || !active) return;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const s = io(API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      s.on('connect', () => {
        if (!active) { s.disconnect(); return; }
        window.__socket = s;
        socketRef.current = s;
      });

      s.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
      });

      s.on('user:online', ({ userId }) => {
        setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
      });

      s.on('user:offline', ({ userId }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });
    };

    initSocket();

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      window.__socket = null;
    };
  }, [user, getToken, fetchConversations]);

  // Refresh conversations when socket receives a new message
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handler = () => {
      fetchLastMessages();
    };
    s.on('chat:message', handler);
    return () => s.off('chat:message', handler);
  }, [fetchLastMessages]);

  const joinChat = useCallback((friendId) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:join', { friendId });
    }
  }, []);

  const sendMessage = useCallback((receiverId, text) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:send', { receiverId, text });
    }
  }, []);

  const sendTyping = useCallback((friendId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:typing', { friendId, isTyping });
    }
  }, []);

  const markRead = useCallback((friendId) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:read', { friendId });
      setUnreadCounts((prev) => ({ ...prev, [friendId]: 0 }));
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        onlineUsers,
        conversations,
        unreadCounts,
        joinChat,
        sendMessage,
        sendTyping,
        markRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);