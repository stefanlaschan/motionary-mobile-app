import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AUTH_API_BASE_URL = 'http://localhost:8082';
const AUTH_TOKENS_KEY = 'authTokens';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LogoutRequest {
  refreshToken: string;
}


export const clearAuthData = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
  await SecureStore.deleteItemAsync('username');
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Login failed: ${error}`);
  }

  const data: AuthResponse = await response.json();

  await SecureStore.setItemAsync('access_token', data.access_token);
  await SecureStore.setItemAsync('refresh_token', data.refresh_token);
  await SecureStore.setItemAsync('username', username);

  return data;
};

export const logout = async (): Promise<void> => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    if (refreshToken) {
      await fetch(`${AUTH_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    await clearAuthData();
  }
};

export const signup = async (data: SignupRequest): Promise<void> => {
  const signupResponse = await fetch(`${AUTH_API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!signupResponse.ok) {
    const errorText = await signupResponse.text();
    if (signupResponse.status === 409) {
      throw new Error('User already exists with this email or username.');
    }
    throw new Error(errorText || 'Signup failed');
  }

  return;
};


export const getAccessToken = async () => {
  return await SecureStore.getItemAsync('access_token');
};
