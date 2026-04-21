import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch user info if we're not on the login page
    if (window.location.pathname === '/login') {
      setLoading(false);
      return;
    }

    apiClient.get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    // Full browser redirect — NOT axios — this is required for OAuth
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const logout = () => {
    window.location.href = 'http://localhost:8081/logout';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);