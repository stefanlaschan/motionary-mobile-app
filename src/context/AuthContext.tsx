import React, { createContext, useContext, useEffect, useState } from 'react';
import { logout as apiLogout, login as apiLogin, getAccessToken } from '@/services/authService';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const tokens = await getAccessToken();
      setLoggedIn(!!tokens);
      setBootstrapping(false);
    })();
  }, []);

  const onLogin = async (username: string, password: string) => {
    await apiLogin(username, password);
    setLoggedIn(true);
  };

  const handleLogout = async () => {
    await apiLogout();
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, bootstrapping, onLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
