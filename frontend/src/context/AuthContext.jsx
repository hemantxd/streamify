import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    setUser(data.user);
    if (data.token) localStorage.setItem('jwt_token', data.token);
    return data;
  };

  const signup = async (fullName, email, password) => {
    const { data } = await axios.post('/auth/signup', { fullName, email, password });
    setUser(data.user);
    if (data.token) localStorage.setItem('jwt_token', data.token);
    return data;
  };

  const onboard = async (formData) => {
    const { data } = await axios.post('/auth/onboard', formData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, onboard, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);