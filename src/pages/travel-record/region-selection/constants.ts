export const MAX_VISIBLE_REGION_SUGGESTIONS = 4;

export const recentSearchStorageOptions = {
  storageKey: 'travel-record-region:recent-searches',
};

export const normalizeSearchText = (text: string) => text.replace(/\s/g, '');
