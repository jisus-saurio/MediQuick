import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = () => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        setIsLoggedIn(true);
        setCurrentUser(sessionData);
        return sessionData;
      } catch (error) {
        console.error('Error parsing session data:', error);
        setIsLoggedIn(false);
        setCurrentUser(null);
        return null;
      }
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
      return null;
    }
  };

  const getUserProfile = () => {
    try {
      return JSON.parse(localStorage.getItem('userProfile') || '{}');
    } catch (error) {
      console.error('Error parsing user profile:', error);
      return {};
    }
  };

  useEffect(() => {
    checkLoginStatus();

    const handleLoginChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('loginStateChanged', handleLoginChange);
    return () => window.removeEventListener('loginStateChanged', handleLoginChange);
  }, []);

  return {
    currentUser,
    isLoggedIn,
    checkLoginStatus,
    getUserProfile
  };
};