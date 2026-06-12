import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import UserAvatar from '../components/ui/UserAvatar';
import ChatWindow from '../components/ChatWindow';

export default function Home() {
  const { user } = useAuth();
  const { conversations, onlineUsers, unreadCounts } = useSocket();
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0a0a1a]">
      <div className="flex h-full max-w-6xl mx-auto">
        {/* Conversations Sidebar */}
        <div className="w-full sm:w-80 lg:w-96 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h1 className="text-lg font-bold text-white">Chats 💬</h1>
            <p className="text-xs text-white/40 mt-0.5">Chat with your friends</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-4xl mb-3">👋</p>
                <p className="text-white/50 text-sm">No conversations yet</p>
                <p className="text-white/30 text-xs mt-1">Add friends from the Friends page to start chatting</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.friend._id}
                  onClick={() => setActiveChat(conv.friend)}
                  className={`w-full flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-all text-left ${
                    activeChat?._id === conv.friend._id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="relative">
                    <UserAvatar user={conv.friend} size="md" />
                    {onlineUsers.includes(conv.friend._id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#34d399] rounded-full border-2 border-[#0a0a1a]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white truncate">{conv.friend.fullName}</p>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-white/30 shrink-0">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-white/40 truncate">
                        {conv.lastMessage ? (
                          conv.lastMessage.sender === user._id ? `You: ${conv.lastMessage.text}` : conv.lastMessage.text
                        ) : (
                          'No messages yet'
                        )}
                      </p>
                      {(unreadCounts[conv.friend._id] || 0) > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#667eea] text-white font-bold shrink-0">
                          {unreadCounts[conv.friend._id]}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden sm:flex flex-1 flex-col">
          {activeChat ? (
            <ChatWindow friend={activeChat} onClose={() => setActiveChat(null)} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl mb-4">💬</p>
                <p className="text-white/50 text-lg">Select a conversation</p>
                <p className="text-white/30 text-sm mt-1">Choose a friend to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: show ChatWindow as full screen overlay */}
      {activeChat && (
        <div className="sm:hidden fixed inset-0 z-50 bg-[#0a0a1a] flex flex-col">
          <ChatWindow friend={activeChat} onClose={() => setActiveChat(null)} />
        </div>
      )}
    </div>
  );
}