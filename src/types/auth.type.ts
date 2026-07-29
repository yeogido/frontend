export interface LoginRequest {
  email: string;
  password: string;
}

// 서버 응답의 result 필드 구조 (스웨거 기준: POST /api/v1/auth/login)
export interface LoginResult {
  userId: number;
  accessToken: string;
  refreshToken: string;
}
