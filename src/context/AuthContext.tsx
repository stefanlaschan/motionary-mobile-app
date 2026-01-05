import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { logout as apiLogout, login as apiLogin, getAccessToken } from '@/services/authService';
import { User } from '@/types/User';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  const syncUserFromToken = (token: string | null) => {
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser({
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        email: decoded.email,
        username: decoded.preferred_username,
      });
      setLoggedIn(true);
    } else {
      setUser(null);
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    (async () => {
      const token = await getAccessToken(); // Ensure this returns the string token
      syncUserFromToken(token);
      setBootstrapping(false);
    })();
  }, []);

  const onLogin = async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    syncUserFromToken(data.access_token);
  };

  const handleLogout = async () => {
    await apiLogout();
    syncUserFromToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loggedIn, bootstrapping, onLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
