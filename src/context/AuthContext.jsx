'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const MOCK_USERS = [
  {
    name: 'Jane Doe',
    email: 'user@example.com',
    password: 'password',
    role: 'customer'
  },
  {
    name: 'Alex Vance',
    email: 'admin@example.com',
    password: 'adminpass',
    role: 'admin'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [onLoginSuccess, setOnLoginSuccess] = useState(null);
  const [isMounted, setIsMounted] = useState(true);

  // Initialize mock users database and check current session on mount
  useEffect(() => {
    setIsMounted(true);
    
    // Check if the mock database exists, if not seed it
    const existingUsers = localStorage.getItem('auracommerce_users');
    if (!existingUsers) {
      localStorage.setItem('auracommerce_users', JSON.stringify(MOCK_USERS));
    }

    // Check active session
    const activeSession = localStorage.getItem('auracommerce_session');
    if (activeSession) {
      try {
        setUser(JSON.parse(activeSession));
      } catch (e) {
        console.error('Failed to parse active user session:', e);
      }
    }
  }, []);

  // Helper to fetch registered users list
  const getUsers = () => {
    if (typeof window === 'undefined') return MOCK_USERS;
    const usersStr = localStorage.getItem('auracommerce_users');
    try {
      return usersStr ? JSON.parse(usersStr) : MOCK_USERS;
    } catch (e) {
      return MOCK_USERS;
    }
  };

  // Sign In function
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getUsers();
        const foundUser = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (foundUser) {
          const userSession = {
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role || 'customer'
          };
          setUser(userSession);
          localStorage.setItem('auracommerce_session', JSON.stringify(userSession));
          setIsAuthModalOpen(false);
          
          if (onLoginSuccess && typeof onLoginSuccess === 'function') {
            onLoginSuccess(userSession);
            setOnLoginSuccess(null); // Reset callback
          }
          resolve(userSession);
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, 800); // Small delay to simulate API response and show premium loaders
    });
  };

  // Sign Up / Register function
  const register = (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getUsers();
        const userExists = users.some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (userExists) {
          reject(new Error('An account with this email already exists.'));
          return;
        }

        const newUser = {
          name,
          email: email.toLowerCase(),
          password,
          role: 'customer'
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('auracommerce_users', JSON.stringify(updatedUsers));

        // Auto log in newly registered user
        const userSession = {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        };
        setUser(userSession);
        localStorage.setItem('auracommerce_session', JSON.stringify(userSession));
        setIsAuthModalOpen(false);

        if (onLoginSuccess && typeof onLoginSuccess === 'function') {
          onLoginSuccess(userSession);
          setOnLoginSuccess(null);
        }
        resolve(userSession);
      }, 800);
    });
  };

  // Sign Out / Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auracommerce_session');
  };

  // Trigger login modal with optional success callback
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
        login,
        register,
        logout,
        showLoginModal,
        isMounted
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
