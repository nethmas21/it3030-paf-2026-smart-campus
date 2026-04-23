import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { loginWithPassword, registerWithPassword } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('smartCampusToken');
    if (!token || window.location.pathname === '/login') {
      setLoading(false);
      return;
    }

    apiClient.get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const logout = () => {
    localStorage.removeItem('smartCampusToken');
    setUser(null);
    window.location.href = '/login';
  };

  const completeOAuthLogin = async (token) => {
    localStorage.setItem('smartCampusToken', token);
    const res = await apiClient.get('/auth/me');
    setUser(res.data.data);
    return res.data.data;
  };

  const loginWithCredentials = async (credentials) => {
    const res = await loginWithPassword(credentials);
    localStorage.setItem('smartCampusToken', res.data.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const registerWithCredentials = async (payload) => {
    const res = await registerWithPassword(payload);
    localStorage.setItem('smartCampusToken', res.data.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      completeOAuthLogin,
      loginWithCredentials,
      registerWithCredentials,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
