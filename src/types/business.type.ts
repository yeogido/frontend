// 카카오 장소 정보 (스웨거 기준: PlaceRequest)
// source는 스웨거상 자유 문자열이지만 명세서에서 현재 KAKAO만 허용한다.
// 백엔드는 source + externalPlaceId가 같으면 기존 장소를 재사용한다.
export interface BusinessPlaceRequest {
  externalPlaceId: string;
  source: string;
  name: string;
  categoryGroupCode?: string;
  roadAddress?: string;
  lotAddress?: string;
  latitude: number;
  longitude: number;
  regionId: number;
}

// 스웨거 기준: BusinessVerifyReqDTO (7개 필드 전부 필수)
// businessNumber는 ^\d{10}$ — 하이픈을 제거하고 보내야 한다.
// openingDate는 format: date — YYYY-MM-DD.
// registrationImageKey는 파일명이 아니라 presigned 업로드로 받은 S3 objectKey다.
export interface BusinessVerifyRequest {
  businessNumber: string;
  openingDate: string;
  representativeName: string;
  registrationImageKey: string;
  businessName: string;
  businessAddress: string;
  place: BusinessPlaceRequest;
}

// 스웨거 기준: BusinessVerifyResDTO
// role은 USER | ADMIN | BUSINESS지만, 문서와 실제 응답 표기가 어긋난 사례가
// 있어 유니온으로 좁히지 않고 string으로 받는다.
export interface BusinessVerifyResult {
  role: string;
  businessInfoId: number;
}

// 스웨거 기준: BusinessInfoResponse (GET /users/me/businesses)
// verifiedAt은 타임존 오프셋이 없는 LocalDateTime('2026-07-26T15:30:00')이라
// new Date()로 파싱하면 로컬 타임존으로 해석돼 날짜가 밀릴 수 있다.
// 표시할 때는 문자열을 그대로 잘라 쓴다.
export interface BusinessInfoResponse {
  businessInfoId: number;
  businessNumber: string;
  businessName: string;
  businessAddress: string;
  representativeName: string;
  verifiedAt: string;
}
