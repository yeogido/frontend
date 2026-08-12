// GET /regions(상위 지역 목록)는 "서울", "부산", "충남"처럼 축약된 이름만
// 내려준다. 정식 명칭(fullName)은 단건 상세(GET /regions/{id})에만 있어서,
// 화면에 정식 명칭을 보여주려고 목록 API 응답 자체를 바꾸거나 항목마다
// 상세를 추가 조회할 필요 없이, 화면 표시 시점에만 이 표로 변환한다.
//
// 강원/전북/제주는 최근 특별자치도로 개편된 공식 명칭을 쓴다(백엔드
// GET /regions/{id}의 fullName도 이미 이 이름을 쓰는 걸 확인함 — 참고:
// constants/regions.ts의 OFFICIAL_PROVINCE_NAME_MAP).
const SHORT_TO_FULL_REGION_NAME: Record<string, string> = {
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원특별자치도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전북특별자치도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
};

/**
 * 축약된 시/도 이름(예: "서울")을 정식 명칭(예: "서울특별시")으로 바꾼다.
 * 화면 표시 전용이다 — 필터링/API 요청 등 로직에는 원본 축약명을 그대로
 * 써야 한다. 매핑 표에 없는 값(이미 정식 명칭이거나 알 수 없는 값)은
 * 에러 없이 원본 그대로 돌려준다.
 */
export function getFullRegionName(shortName: string): string {
  return SHORT_TO_FULL_REGION_NAME[shortName] ?? shortName;
}
