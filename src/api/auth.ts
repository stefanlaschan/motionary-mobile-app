import * as SecureStore from 'expo-secure-store';

const AUTH_LOGIN_URL = 'http://localhost:8080/auth/login';
const AUTH_LOGOUT_URL = 'http://localhost:8080/auth/logout';
const AUTH_TOKENS_KEY = 'authTokens';

export class AuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  /**
   * Epoch millis when the access token expires on the client.
   */
  expiresAt: number;
  tokenType: string;
};

async function saveTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKENS_KEY, JSON.stringify(tokens));
}

export async function getAuthTokens(): Promise<AuthTokens | null> {
  const stored = await SecureStore.getItemAsync(AUTH_TOKENS_KEY);
  if (!stored) return null;

  try {
    const parsed: AuthTokens = JSON.parse(stored);
    return parsed;
  } catch {
    await SecureStore.deleteItemAsync(AUTH_TOKENS_KEY);
    return null;
  }
}

export async function clearAuthTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKENS_KEY);
}

export async function login(username: string, password: string): Promise<AuthTokens> {
  if (!username || !password) {
    throw new AuthError('Please enter both username and password.');
  }

  const response = await fetch(AUTH_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    // Log for debugging; message kept generic for the UI
    console.log('Auth error response:', text);
    throw new AuthError('Invalid username or password.', response.status);
  }

  const json = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type?: string;
  };

  const tokens: AuthTokens = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
    tokenType: json.token_type ?? 'Bearer',
  };

  await saveTokens(tokens);

  return tokens;
}

export async function logout(): Promise<void> {
  const tokens = await getAuthTokens();

  if (tokens?.refreshToken) {
    try {
      await fetch(AUTH_LOGOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    } catch (e) {
      console.warn('Failed to notify backend about logout', e);
    }
  }

  await clearAuthTokens();
}
