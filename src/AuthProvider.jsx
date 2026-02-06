import { useState, useEffect } from 'react';
import { AuthContext } from './hooks/AuthContext';
import { deleteSession, getSession, UnauthorizedError } from './data/api';
import { useMessaging } from './hooks/MessagingContext';
import { redirect, useLocation } from 'react-router';

export const AuthProvider = ({ children }) => {

  // context/provider
  const { setMessage } = useMessaging();

  // AuthContext properties (userSession, isLoading, updateUserSession, checkSession, logout)
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserSession = (userSession) => setUserSession(userSession);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      const newSession = await getSession();
      setUserSession(newSession);
      setMessage('Session refreshed', 'info');
    } catch (error) {
      setUserSession(null);
      if (!(error instanceof UnauthorizedError)) {
        setMessage('Server error', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (location = '/') => {
    try {
      await deleteSession();
    } catch (error) {
      // do nothing on error - but catch
    } finally {
      setUserSession(null);
    }
  };

  useEffect(() => {
    console.debug('AuthProvider: useEffect()');
    const initSession = async () => {
      await checkSession();
      setIsLoading(false);
    };
    initSession();
  }, []);

  return (
    <AuthContext.Provider value={{ userSession, isLoading, updateUserSession, checkSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
