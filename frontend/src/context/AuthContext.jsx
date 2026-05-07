import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios for cookies
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      // The browser sends cookies automatically
      const res = await axios.get('/api/auth/me');
      if (res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.log('No active session found');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    // Tokens are set in cookies by the server automatically
    setUser(res.data.user);
  };

  const signup = async (name, email, password, role) => {
    const res = await axios.post('/api/auth/register', { name, email, password, role });
    // Tokens are set in cookies by the server automatically
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
