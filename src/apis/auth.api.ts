import { apiClient } from './common';

import type {
  CheckEmailResult,
  LoginRequest,
  LoginResult,
  ResetPasswordRequest,
  SignupRequest,
  SignupResult,
  SocialLoginRequest,
  SocialLoginResult,
  SocialSignupCompleteRequest,
  VerifyEmailCodeResult,
  VerifyPasswordResetCodeResult,
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

export async function sendEmailCode(email: string): Promise<void> {
  await apiClient.post('/auth/email/send-code', { email });
}

export async function verifyEmailCode(
  email: string,
  authCode: string
): Promise<VerifyEmailCodeResult> {
  const { data: result } = await apiClient.post<VerifyEmailCodeResult>(
    '/auth/email/verify-code',
    { email, authCode }
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

export async function sendPasswordResetCode(email: string): Promise<void> {
  await apiClient.post('/auth/password/send-code', { email });
}

export async function verifyPasswordResetCode(
  email: string,
  authCode: string
): Promise<VerifyPasswordResetCodeResult> {
  const { data: result } = await apiClient.post<VerifyPasswordResetCodeResult>(
    '/auth/password/verify-code',
    { email, authCode }
  );

  return result;
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<void> {
  await apiClient.patch('/auth/password/reset', data);
}
