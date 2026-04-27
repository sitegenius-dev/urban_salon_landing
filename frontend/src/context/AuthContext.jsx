import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('salon_token');
    const u = localStorage.getItem('salon_user');

    if (t && u) {
      try {
        const parsed = JSON.parse(u);
        setToken(t);
        setUser(parsed);
        // Validate token via GET /api/auth/me
        api.get('/auth/me', { headers: { Authorization: `Bearer ${t}` } })
          .then(res => {
            setUser(res.data);
            localStorage.setItem('salon_user', JSON.stringify(res.data));
          })
          .catch(() => {
            localStorage.removeItem('salon_token');
            localStorage.removeItem('salon_user');
            setToken(null);
            setUser(null);
          })
          .finally(() => setLoading(false));
        return;
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = (tokenVal, userVal) => {
    localStorage.setItem('salon_token', tokenVal);
    localStorage.setItem('salon_user', JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
  };

  const logout = () => {
    localStorage.removeItem('salon_token');
    localStorage.removeItem('salon_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
