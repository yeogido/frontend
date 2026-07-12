import apiClient from './axios';

import type {
  LoginRequest,
  LoginResponse,
} from '../types/auth.type';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const { data: response } = await apiClient.post<LoginResponse>(
    '/auth/login',
    data
  );

  return response;
}
