// 인증 완료 후 프로필/미리보기 화면이 보여주는 사업장 정보.
// openedAt(개업일자)은 GET /users/me/businesses 응답에 없어서 목록 재조회로는
// 복원할 수 없다. 그래서 인증 직후에는 제출한 폼 값을 그대로 넘겨서 채운다.
export interface BusinessProfile {
  readonly businessName: string;
  readonly businessAddress: string;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly openedAt: string;
}
