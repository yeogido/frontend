export const BUSINESS_ROLE = 'BUSINESS';

/**
 * 소상공인 권한인지 본다.
 *
 * 권한의 진실은 서버에 있다. 백엔드도 accessToken에 박힌 role이 아니라
 * userId로 DB를 다시 조회해 인가하므로, 프론트도 GET /users/me가 준 값만
 * 여기에 넣는다. 로컬에 저장해 둔 role은 인증 직후나 재로그인 시점에
 * 서버와 어긋난다.
 *
 * 문서와 실제 응답의 표기가 어긋난 사례가 있어 대소문자를 맞춰 비교한다.
 */
export function isBusinessRole(role: string | undefined) {
  return role?.toUpperCase() === BUSINESS_ROLE;
}
