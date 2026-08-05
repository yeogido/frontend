import { apiClient } from './common';

import type {
  CheckEmailResult,
  LoginRequest,
  LoginResult,
  SignupRequest,
  SignupResult,
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

export async function checkEmail(email: string): Promise<CheckEmailResult> {
  const { data: result } = await apiClient.get<CheckEmailResult>(
    '/auth/check-email',
    { params: { email } }
  );

  return result;
}

export async function signup(data: SignupRequest): Promise<SignupResult> {
  const { data: result } = await apiClient.post<SignupResult>(
    '/auth/signup',
    data
  );

  return result;
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
