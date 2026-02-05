import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './hooks/AuthContext';
import { deleteSession, getSession, UnauthorizedError } from './data/api';
import { useMessaging } from './hooks/MessagingContext';
import { redirect } from 'react-router';

export const AuthProvider = ({ children }) => {

  const { setMessage } = useMessaging();

  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserSession = (userSession) => setUserSession(userSession);

  const checkSession = async () => {
    try {
      const newSession = await getSession();
      setUserSession(newSession);
      setMessage('Session refreshed', 'info');
    } catch (error) {
      setUserSession(null);
      if (!(error instanceof UnauthorizedError)) {
        setMessage('Server error', 'error');
      }
      return redirect('/login');
    }
  };

  const logout = async () => {
    try {
      await deleteSession();
    } catch (error) {
      // do nothing on error - but catch
    } finally {
      setUserSession(null);
    }
  };

  useEffect(() => {
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
