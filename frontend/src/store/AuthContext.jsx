import { useState, useCallback } from 'react';
import { AuthContext } from './context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const authStorage = localStorage.getItem('auth');
      if (authStorage) {
        const data = JSON.parse(authStorage);
        const token = data.access;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return { id: payload.user_id, username: payload.username, role: payload.role };
        }
      }
    } catch {
      localStorage.removeItem('auth');
    }
    return null;
  });

  const login = useCallback((data) => {
    localStorage.setItem('auth', JSON.stringify(data));
    const token = data.access;
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({ id: payload.user_id, username: payload.username, role: payload.role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};