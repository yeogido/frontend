import { regionSearchKeywords } from '../constants/regions';
import {
  festivalCategoryOptions,
  festivalSortOptions,
  getFestivalCategoryLabel,
  type FestivalSelectedFilters,
} from '../pages/festival/constants/filters';
import {
  festivalSearchResults,
  recentFestivalPreviews,
} from '../pages/festival/constants/festivals';
import { festivalSearchSuggestions } from '../pages/festival/constants/search';
import type { FestivalPreview } from '../pages/festival/types';

const PAGE_SIZE = 6;
const TOTAL_COUNT = 18;
const DEFAULT_FILTERS: FestivalSelectedFilters = {
  sort: festivalSortOptions[0].value,
  category: festivalCategoryOptions[0].value,
};
const MOCK_SEARCH_KEYWORDS = [
  ...regionSearchKeywords,
  ...festivalSearchSuggestions,
  ...festivalSearchResults.flatMap((festival) => [
    festival.title,
    festival.period,
    festival.location,
    festival.category,
    getFestivalCategoryLabel(festival.category),
  ]),
  ...festivalSortOptions.flatMap((option) => [option.label, option.value]),
  ...festivalCategoryOptions.flatMap((option) => [
    option.label,
    option.value,
  ]),
];
const NORMALIZED_MOCK_SEARCH_KEYWORDS = MOCK_SEARCH_KEYWORDS.map((keyword) =>
  normalizeSearchText(keyword)
);

export interface FestivalPage {
  content: FestivalPreview[];
  page: number;
  last: boolean;
}

interface FetchFestivalsParams {
  page: number;
  filters: FestivalSelectedFilters;
  keyword?: string;
  region?: string;
  subRegion?: string;
}

interface FetchRecentFestivalsParams {
  page: number;
}

function normalizeSearchText(text: string) {
  return text.replace(/\s/g, '').toLowerCase();
}

function hasMockSearchResult(keyword: string) {
  const normalizedKeyword = normalizeSearchText(keyword);

  if (!normalizedKeyword) {
    return true;
  }

  return NORMALIZED_MOCK_SEARCH_KEYWORDS.some((mockKeyword) =>
    mockKeyword.includes(normalizedKeyword)
  );
}

function createMockFestival(
  id: number,
  filters: FestivalSelectedFilters,
  festivals: readonly FestivalPreview[],
  searchLabel = ''
): FestivalPreview {
  const baseFestival = festivals[(id - 1) % festivals.length];
  const titlePrefix =
    searchLabel && !baseFestival.title.includes(searchLabel)
      ? searchLabel
      : '';

  return {
    ...baseFestival,
    id,
    title: titlePrefix
      ? `${titlePrefix} ${baseFestival.title}`
      : baseFestival.title,
    liked:
      filters.sort === DEFAULT_FILTERS.sort ? baseFestival.liked : id % 2 === 0,
  };
}

function createMockRecentFestival(id: number): FestivalPreview {
  const baseFestival =
    recentFestivalPreviews[(id - 1) % recentFestivalPreviews.length];

  return {
    ...baseFestival,
    id,
    liked: id % 2 === 0 ? !baseFestival.liked : baseFestival.liked,
  };
}

export async function fetchFestivals({
  page,
  filters,
  keyword = '',
  region = '',
  subRegion = '',
}: FetchFestivalsParams): Promise<FestivalPage> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 500);
  });

  const regionLabel =
    region && subRegion ? `${region} ${subRegion}` : region || subRegion;
  const searchLabel = keyword || regionLabel;

  if (keyword && !hasMockSearchResult(keyword)) {
    return {
      content: [],
      page,
      last: true,
    };
  }

  const filteredFestivals = festivalSearchResults.filter(
    (festival) =>
      filters.category === DEFAULT_FILTERS.category ||
      festival.category === filters.category
  );
  const totalCount = filteredFestivals.length > 0 ? TOTAL_COUNT : 0;
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, totalCount);
  const content = Array.from({ length: end - start }, (_, index) =>
    createMockFestival(
      start + index + 1,
      filters,
      filteredFestivals,
      searchLabel
    )
  );

  return {
    content:
      filters.sort === DEFAULT_FILTERS.sort ? content : [...content].reverse(),
    page,
    last: end >= TOTAL_COUNT,
  };
}

export async function fetchRecentFestivals({
  page,
}: FetchRecentFestivalsParams): Promise<FestivalPage> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 500);
  });

  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL_COUNT);
  const content = Array.from({ length: end - start }, (_, index) =>
    createMockRecentFestival(start + index + 1)
  );

  return {
    content,
    page,
    last: end >= TOTAL_COUNT,
  };
}
