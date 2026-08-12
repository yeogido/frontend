export interface RegionInfo {
  name: string;
  /** 화면에 보여줄 지역 전체 이름(예: "충청남도"). name은 여전히 다른
   * API 호출·쿼리 파라미터에 쓰이는 축약형(예: "충남")이라 그대로 둔다. */
  displayName: string;
  description: string;
}
