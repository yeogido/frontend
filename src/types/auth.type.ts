export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number | string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
}
