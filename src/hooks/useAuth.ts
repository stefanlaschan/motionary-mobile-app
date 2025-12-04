import { useEffect, useState } from 'react';
import { getAuthTokens, logout as apiLogout } from '../api/auth';

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const tokens = await getAuthTokens();
      setLoggedIn(!!tokens);
      setBootstrapping(false);
    })();
  }, []);

  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  const handleLogout = async () => {
    await apiLogout();
    setLoggedIn(false);
  };

  return { loggedIn, bootstrapping, handleLoginSuccess, handleLogout };
}
