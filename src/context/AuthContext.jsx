import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const USERS_KEY = 'dashboard_users';

const loadUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
};

const saveUsers = (u) => { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch {} };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('dashboard_current_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    }
  }, []);

  const register = ({ username, password, displayName }) => {
    const users = loadUsers();
    if (users[username]) return { ok: false, error: 'User exists' };
    users[username] = { password, displayName: displayName || username };
    saveUsers(users);
    return { ok: true };
  };

  const login = ({ username, password }) => {
    const users = loadUsers();
    const u = users[username];
    if (!u || u.password !== password) return { ok: false, error: 'Invalid credentials' };
    const payload = { username, displayName: u.displayName };
    setUser(payload);
    try { localStorage.setItem('dashboard_current_user', JSON.stringify(payload)); } catch {}
    return { ok: true, user: payload };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dashboard_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
