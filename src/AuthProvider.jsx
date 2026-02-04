import { useState, useEffect } from 'react';
import { AuthContext } from './hooks/AuthContext';
import { deleteSession, getSession } from './data/api';

export const AuthProvider = ({ children }) => {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserSession = (userSession) => setUserSession(userSession);

  const checkSession = async () => {
    setUserSession(await getSession());
  };

  const logout = async () => {
    setUserSession(await deleteSession());
  };

  useEffect(() => {
    checkSession();
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ userSession, isLoading, updateUserSession, checkSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
