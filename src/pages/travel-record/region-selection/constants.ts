export const MAX_VISIBLE_REGION_SUGGESTIONS = 4;

export const recentSearchStorageOptions = {
  storageKey: 'travel-record-region:recent-searches',
  fallbackSearches: ['전주', '부산', '강릉', '제주도'],
};

export const normalizeSearchText = (text: string) => text.replace(/\s/g, '');
