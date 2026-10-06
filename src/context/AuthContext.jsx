import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, getCurrentUser } from '../api/auth';
import { getAuthToken, setAuthToken, removeAuthToken } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res.success) {
            setCurrentUser(res.user);
          } else {
            removeAuthToken();
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for unauthorized events to clear state
    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success) {
      setAuthToken(res.token);
      setCurrentUser(res.user);
      return res;
    }
    throw new Error('Login failed');
  };

  const register = async (name, email, password) => {
    const res = await registerUser(name, email, password);
    if (res.success) {
      setAuthToken(res.token);
      setCurrentUser(res.user);
      return res;
    }
    throw new Error('Registration failed');
  };

  const logout = () => {
    removeAuthToken();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
