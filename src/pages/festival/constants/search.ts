import { regionSearchKeywords } from '../../../constants/regions';

export const FESTIVAL_RECENT_SEARCH_STORAGE_KEY =
  'festival-search:recent-searches';

export const festivalRecentSearchKeywords = [
  '전주',
  '제주도',
  '제주도',
  '전주',
  '전주',
] as const;

export const festivalSearchSuggestions = [
  '양평',
  '양평수박축제',
  '부여 서동연꽃축제',
  ...regionSearchKeywords,
] as const;
