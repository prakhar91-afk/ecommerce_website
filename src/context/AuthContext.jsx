'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [onLoginSuccess, setOnLoginSuccess] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedSession = localStorage.getItem('auracommerce_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Basic token expiry check
        if (parsed.token && parsed.user) {
          setUser(parsed.user);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
        localStorage.removeItem('auracommerce_session');
      }
    }
  }, []);

  // Sign In using real backend JWT
  const login = (email, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/auth?action=login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          reject(new Error(data.error || 'Invalid email or password.'));
          return;
        }

        const userSession = data.user;
        setUser(userSession);
        localStorage.setItem(
          'auracommerce_session',
          JSON.stringify({ user: userSession, token: data.token })
        );
        setIsAuthModalOpen(false);

        if (onLoginSuccess && typeof onLoginSuccess === 'function') {
          onLoginSuccess(userSession);
          setOnLoginSuccess(null);
        }
        resolve(userSession);
      } catch (err) {
        reject(new Error('Network error. Please try again.'));
      }
    });
  };

  // Sign Up using real backend
  const register = (name, email, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/auth?action=signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          reject(new Error(data.error || 'Registration failed.'));
          return;
        }

        const userSession = data.user;
        setUser(userSession);
        localStorage.setItem(
          'auracommerce_session',
          JSON.stringify({ user: userSession, token: data.token })
        );
        setIsAuthModalOpen(false);

        if (onLoginSuccess && typeof onLoginSuccess === 'function') {
          onLoginSuccess(userSession);
          setOnLoginSuccess(null);
        }
        resolve(userSession);
      } catch (err) {
        reject(new Error('Network error. Please try again.'));
      }
    });
  };

  // Get the stored JWT token (for protected requests)
  const getToken = () => {
    const savedSession = localStorage.getItem('auracommerce_session');
    if (!savedSession) return null;
    try {
      return JSON.parse(savedSession).token || null;
    } catch {
      return null;
    }
  };

  // Sign Out
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auracommerce_session');
  };

  // Show login modal with optional post-login callback
  const showLoginModal = (callback = null) => {
    if (callback) {
      setOnLoginSuccess(() => callback);
    } else {
      setOnLoginSuccess(null);
    }
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isMounted,
        login,
        register,
        logout,
        getToken,
        showLoginModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
