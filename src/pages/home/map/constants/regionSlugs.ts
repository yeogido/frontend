/**
 * 지도 데이터(korea-province.json / korea-city.json)의 한글 지역명을
 * RegionInfoPage(regionInfoMap)가 쓰는 영문 슬러그로 변환하는 매핑표.
 *
 * regionInfoMap에 아직 없는 지역(경기/강원/충청/전라/경상/제주/세종)은
 * RegionInfoPage 자체 fallback(busan)으로 흘러간다.
 */
export const REGION_SLUG_MAP: Record<string, string> = {
  부산광역시: 'busan',
  서울특별시: 'seoul',
  인천광역시: 'incheon',
  대구광역시: 'daegu',
  대전광역시: 'daejeon',
  광주광역시: 'gwangju',
  울산광역시: 'ulsan',
};

export function getRegionSlug(regionName: string): string {
  return REGION_SLUG_MAP[regionName] ?? regionName;
}