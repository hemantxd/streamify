import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/communities', label: 'Communities', icon: '🌍' },
  { path: '/friends', label: 'Friends', icon: '👥' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const i = setInterval(fetchNotifications, 30000);
    return () => clearInterval(i);
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {
      /* empty */
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      fetchNotifications();
    } catch {
      /* empty */
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <span className="text-lg font-bold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent hidden sm:inline">Fluentra</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#12122a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between p-3 border-b border-white/10">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[#667eea] hover:underline">Mark all read</button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-white/40 text-sm text-center py-6">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className="p-3 border-b border-white/5">
                          <div
                            onClick={() => { if (!n.read) markRead(n._id); }}
                            className={`flex items-start gap-3 cursor-pointer transition-all ${n.read ? 'opacity-50' : ''}`}
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-sm">
                              {n.from?.profilePicture ? (
                                <img src={n.from.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                n.from?.fullName?.charAt(0) || '?'
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/80">{n.message}</p>
                              <p className="text-xs text-white/30 mt-0.5">
                                {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-[#667eea] shrink-0 mt-1.5" />}
                          </div>

                          {/* "View Request" button for friend_request notifications */}
                          {n.type === 'friend_request' && (
                            <div className="flex gap-2 mt-2 ml-10">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await axios.put(`/notifications/${n._id}/read`);
                                  setShowNotifs(false);
                                  navigate('/friends?tab=requests');
                                }}
                                className="flex-1 py-1.5 text-xs font-medium bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 rounded-lg hover:bg-[#34d399]/25 transition-all"
                              >
                                View Request
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <Link to="/profile" className="flex items-center gap-2 sm:gap-3 hover:bg-white/5 p-1.5 rounded-lg transition-all">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-sm font-bold">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white">{user?.fullName?.charAt(0) || '?'}</span>
                )}
              </div>
              <span className="text-sm text-white/70 hidden sm:block">{user?.fullName}</span>
            </Link>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 ml-1 hidden sm:block">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}