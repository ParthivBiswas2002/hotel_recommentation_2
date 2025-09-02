// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

const useAuth = () => {
  // Get initial state from localStorage
  const getInitialUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  const getInitialSignInState = () => {
    return localStorage.getItem('isSignedIn') === 'true';
  };

  const [isSignedIn, setIsSignedIn] = useState(getInitialSignInState);
  const [userData, setUserData] = useState(getInitialUserData);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isSignedIn && userData) {
      localStorage.setItem('isSignedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('userData');
    }
  }, [isSignedIn, userData]);

  const login = (user) => {
    setIsSignedIn(true);
    setUserData(user);
  };

  const logout = () => {
    setIsSignedIn(false);
    setUserData(null);
    // Clear all auth-related data
    localStorage.removeItem('isSignedIn');
    localStorage.removeItem('userData');
  };

  return {
    isSignedIn,
    userData,
    login,
    logout
  };
};

export default useAuth;
