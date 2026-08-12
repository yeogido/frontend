export const MAX_VISIBLE_REGION_SUGGESTIONS = 4;

export const recentSearchStorageOptions = {
  storageKey: 'travel-record-region:recent-searches',
  // 지역 검색으로 찾을 수 있는 이름이어야 칩을 눌러 선택할 수 있다.
  // ('제주도'는 검색 결과가 없어 '제주'로 둔다.)
  fallbackSearches: ['전주', '부산', '강릉', '제주'],
};

export const normalizeSearchText = (text: string) => text.replace(/\s/g, '');
