import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import UserAvatar from './ui/UserAvatar';

export default function ChatWindow({ friend, onClose }) {
  const { joinChat, markRead } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const { data } = await axios.get(`/messages/${friend._id}`);
      setMessages(data.messages);
    } catch { /* empty */ }
    setLoading(false);
  }, [friend._id]);

  useEffect(() => {
    if (friend) {
      joinChat(friend._id);
      markRead(friend._id);
      loadMessages();
    }
  }, [friend, loadMessages, joinChat, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming messages via socket
  useEffect(() => {
    const socket = window.__socket;
    if (!socket) return;

    const handler = (message) => {
      const isRelevant =
        (message.sender._id === friend._id && message.receiver._id === user._id) ||
        (message.sender._id === user._id && message.receiver._id === friend._id);
      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [friend._id, user._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput('');
    setSending(true);

    try {
      // Use REST API to send — always works regardless of socket state
      const { data } = await axios.post('/messages', {
        receiverId: friend._id,
        text,
      });

      // Add the message locally immediately
      setMessages((prev) => [...prev, data.message]);

      // Also emit via socket for real-time delivery to receiver
      const socket = window.__socket;
      if (socket) {
        socket.emit('chat:send', { receiverId: friend._id, text });
      }
    } catch (err) {
      console.error('Send failed:', err);
      // Re-add the text to input on failure
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <UserAvatar user={friend} size="md" />
          <div>
            <p className="text-sm font-semibold text-white">{friend.fullName}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white/70 text-lg">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/10 border-t-[#667eea] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">No messages yet. Say hello!</div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender._id === user._id;
            return (
              <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-br-md'
                    : 'bg-white/10 text-white/90 rounded-bl-md'
                }`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-white/50' : 'text-white/30'}`}>
                    {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 shrink-0">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message and press Enter..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#667eea] transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-5 py-2.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}