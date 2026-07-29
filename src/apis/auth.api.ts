import { apiClient } from './common';

import type {
  LoginRequest,
  LoginResult,
} from '../types/auth.type';

export async function login(data: LoginRequest): Promise<LoginResult> {
  const { data: result } = await apiClient.post<LoginResult>(
    '/auth/login',
    data
  );

  return result;
}
