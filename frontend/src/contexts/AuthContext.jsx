import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('db_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      localStorage.removeItem('db_user');
      return null;
    }
  });
  const [role, setRole] = useState(() => localStorage.getItem('db_role') || null);

  const login = (token, userData, userRole) => {
    localStorage.setItem('db_token', token);
    localStorage.setItem('db_user', JSON.stringify(userData));
    localStorage.setItem('db_role', userRole);
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('db_token');
    localStorage.removeItem('db_user');
    localStorage.removeItem('db_role');
    setUser(null);
    setRole(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('db_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
