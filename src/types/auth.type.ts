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

// provider별로 요청 바디 형태가 다르다.
// - NAVER: JS SDK가 response_type=token(암묵적 인증)을 지원해 프론트가
//   accessToken을 직접 받아 그대로 전달한다 (확정 스펙).
// - KAKAO: TODO(백엔드 스펙 확정 대기) — Kakao.Auth.login(팝업)이 최신
//   JS SDK에 없어 Auth.authorize(리다이렉트)로 전환했는데, 이 경우
//   프론트는 accessToken이 아니라 인가 코드(code)만 받는다. code→token
//   교환은 Client Secret이 필요해 프론트에서 할 수 없고 백엔드가 해야
//   한다. 아래 필드(code, redirectUri)는 잠정안 — 백엔드 확정 스펙에
//   맞춰 필드명을 조정해야 할 수 있다.
export type SocialLoginRequest =
  | { provider: 'NAVER'; accessToken: string }
  | { provider: 'KAKAO'; code: string; redirectUri: string };

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

// 이메일 회원가입 전용 gender. 소셜 로그인 프로필 완성 폼(SocialGender)과
// 달리 '선택 안 함'(NONE)을 허용한다 (스웨거 기준: POST /api/v1/auth/signup).
export type SignupGender = 'MALE' | 'FEMALE' | 'NONE';

export interface CheckEmailResult {
  isAvailable: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  gender: SignupGender;
  birthYear: string;
  regionId: number;
}

// 서버 응답의 result 필드 구조 (스웨거 기준: POST /api/v1/auth/signup)
export interface SignupResult {
  userId: number;
}
