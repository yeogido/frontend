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

export type SocialProvider = 'KAKAO';

// TODO(백엔드 스펙 확정 대기): 카카오 로그인을 Auth.login(팝업) 대신
// Auth.authorize(리다이렉트)로 전환하면서, 프론트는 이제 카카오
// accessToken이 아니라 인가 코드(code)만 받는다. code→token 교환은
// Client Secret이 필요해 프론트에서 할 수 없고 백엔드가 해야 한다.
// 아래 필드(code, redirectUri)는 잠정안 — 백엔드 확정 스펙에 맞춰
// 필드명을 조정해야 할 수 있다.
export interface SocialLoginRequest {
  provider: SocialProvider;
  code: string;
  redirectUri: string;
}

// 서버 응답의 result 필드 구조 (스웨거 기준: POST /api/v1/auth/social-login)
// 기존 회원(isNewUser: false)이면 userId/accessToken/refreshToken이,
// 신규 회원(isNewUser: true)이면 temporaryToken/email/name이 채워진다.
export interface SocialLoginResult {
  isNewUser: boolean;
  userId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  temporaryToken: string | null;
  email: string | null;
  name: string | null;
}

export type SocialGender = 'MALE' | 'FEMALE';

export interface SocialSignupCompleteRequest {
  temporaryToken: string;
  name: string;
  gender: SocialGender;
  birthYear: string;
  regionId: number;
}
