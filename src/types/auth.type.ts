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

export type SocialProvider = 'KAKAO' | 'NAVER';

// provider별로 요청 바디 형태가 다르다 (백엔드 스펙 확정).
// - NAVER: JS SDK가 response_type=token(암묵적 인증)을 지원해 프론트가
//   accessToken을 직접 받아 그대로 전달한다.
// - KAKAO: Auth.authorize(리다이렉트)로 받은 인가 코드(authorizationCode)와
//   그때 사용한 redirectUri를 그대로 전달한다. code→token 교환은 백엔드가
//   카카오 토큰 API와 통신해 수행한다 (프론트는 관여하지 않음).
export type SocialLoginRequest =
  | { provider: 'NAVER'; accessToken: string }
  | { provider: 'KAKAO'; authorizationCode: string; redirectUri: string };

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

export type SocialGender = 'MALE' | 'FEMALE' | 'NONE';

export interface SocialSignupCompleteRequest {
  temporaryToken: string;
  name: string;
  gender: SocialGender;
  birthYear: string;
  regionId: number;
}
