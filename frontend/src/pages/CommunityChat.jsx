import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import UserAvatar from '../components/ui/UserAvatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const LANG_DATA = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', flag: '🇪🇸' },
  fr: { name: 'French', flag: '🇫🇷' },
  de: { name: 'German', flag: '🇩🇪' },
  it: { name: 'Italian', flag: '🇮🇹' },
  pt: { name: 'Portuguese', flag: '🇵🇹' },
  ja: { name: 'Japanese', flag: '🇯🇵' },
  ko: { name: 'Korean', flag: '🇰🇷' },
  zh: { name: 'Chinese', flag: '🇨🇳' },
  hi: { name: 'Hindi', flag: '🇮🇳' },
};

export default function CommunityChat() {
  const { language } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [members, setMembers] = useState(0);
  const messagesEndRef = useRef(null);

  const lang = LANG_DATA[language];

  useEffect(() => {
    if (!user?.joinedCommunities?.includes(language)) {
      navigate(`/communities/${language}`, { replace: true });
      return;
    }
    loadMessages();
    joinCommunityRoom();
  }, [language, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for community messages via socket
  useEffect(() => {
    const socket = window.__socket;
    if (!socket) return;

    const handler = (message) => {
      if (message.community === language) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on('community:message', handler);
    return () => socket.off('community:message', handler);
  }, [language]);

  const joinCommunityRoom = () => {
    const socket = window.__socket;
    if (socket) {
      socket.emit('community:join', { language });
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await axios.get(`/communities/${language}/messages`);
      setMessages(data.messages);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput('');
    setSending(true);

    try {
      await axios.post('/communities/message', { language, text });
    } catch (err) {
      console.error('Send failed:', err);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0a0a1a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/communities/${language}`)} className="text-white/40 hover:text-white/70 text-sm mr-1">←</button>
          <span className="text-2xl">{lang?.flag || '🌐'}</span>
          <div>
            <p className="text-sm font-semibold text-white">{lang?.name || language} Community Chat</p>
            <p className="text-xs text-white/40">{messages.length} messages</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-white/30 text-sm">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender._id === user._id;
            return (
              <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isMine && (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-[10px] font-bold text-white">
                    {m.sender?.profilePicture ? (
                      <img src={m.sender.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      m.sender?.fullName?.charAt(0) || '?'
                    )}
                  </div>
                )}
                <div className={`max-w-[70%] ${isMine ? 'order-1' : ''}`}>
                  {!isMine && <p className="text-[10px] text-white/30 mb-0.5 ml-1">{m.sender?.fullName}</p>}
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-br-md'
                      : 'bg-white/10 text-white/90 rounded-bl-md'
                  }`}>
                    <p>{m.text}</p>
                    <p className="text-[10px] mt-0.5 opacity-50">
                      {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 shrink-0 bg-white/5">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder={`Message #${lang?.name || language}...`}
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