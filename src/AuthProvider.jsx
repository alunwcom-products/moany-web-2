import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './hooks/AuthContext';
import { deleteSession, getSession } from './data/api';
import { useError } from './hooks/ErrorContext';

export const AuthProvider = ({ children }) => {

  const { setMessage } = useError();

  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserSession = (userSession) => setUserSession(userSession);

  const checkSession = useCallback(async () => {
    const newSession = await getSession();
    setUserSession(newSession);
    if (newSession) {
      setMessage('Session refreshed', 'info');
    } else {
      //setMessage('Session expired', 'error');
    }
  }, [setMessage]);

  const logout = async () => {
    setUserSession(await deleteSession());
  };

  useEffect(() => {
    const initSession = async () => {
      await checkSession();
      setIsLoading(false);
    };
    initSession();
  }, [checkSession]);

  return (
    <AuthContext.Provider value={{ userSession, isLoading, updateUserSession, checkSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
