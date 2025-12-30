import { useEffect, useState } from 'react';
import { logout, getAccessToken } from '../services/authService';

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const tokens = await getAccessToken();
      setLoggedIn(!!tokens);
      setBootstrapping(false);
    })();
  }, []);

  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
  };

  return { loggedIn, bootstrapping, handleLoginSuccess, handleLogout };
}
