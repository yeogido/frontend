import { apiClient } from './common';

import type {
  LoginRequest,
  LoginResult,
  SocialLoginRequest,
  SocialLoginResult,
  SocialSignupCompleteRequest,
} from '../types/auth.type';

export async function login(data: LoginRequest): Promise<LoginResult> {
  const { data: result } = await apiClient.post<LoginResult>(
    '/auth/login',
    data
  );

  return result;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function socialLogin(
  data: SocialLoginRequest
): Promise<SocialLoginResult> {
  const { data: result } = await apiClient.post<SocialLoginResult>(
    '/auth/social-login',
    data
  );

  return result;
}

export async function completeSocialSignup(
  data: SocialSignupCompleteRequest
): Promise<LoginResult> {
  const { data: result } = await apiClient.post<LoginResult>(
    '/auth/social-signup/complete',
    data
  );

  return result;
}
