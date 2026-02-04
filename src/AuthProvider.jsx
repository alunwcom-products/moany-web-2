import { useState, useEffect } from 'react';
import { AuthContext } from './hooks/AuthContext';

const BASE_URL = 'http://localhost:8888';

export const AuthProvider = ({ children }) => {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const getResponse = await fetch(`${BASE_URL}/session`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      console.debug(`GET session response [Auth]: ${getResponse.status}`);
      if (getResponse.ok) {
        const data = await getResponse.json();
        console.debug(`GET session user [Auth]: ${JSON.stringify(data)}`);
        setUserSession({ user: data.user });
      } else {
        setUserSession(null);
      }
    } catch (error) {
      console.error('Caught error [Auth]: ', error);
      setUserSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = (userSession) => setUserSession(userSession);

  const logout = async () => {
    const deleteResponse = await fetch(`${BASE_URL}/session`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });
    console.debug(`DELETE session response: ${deleteResponse.status}`);
    setUserSession(null);
  };

  return (
    <AuthContext.Provider value={{ userSession, isLoading, login, checkSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
