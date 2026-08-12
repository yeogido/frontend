interface RecentSearchStorageOptions {
  storageKey: string;
  maxItems?: number;
}

interface AddRecentSearchOptions extends RecentSearchStorageOptions {
  currentSearches?: readonly string[];
}

const DEFAULT_RECENT_SEARCH_LIMIT = 10;

export const getUniqueSearches = (searches: readonly string[]) => [
  ...new Set(searches),
];

const limitRecentSearches = (
  searches: readonly string[],
  maxItems = DEFAULT_RECENT_SEARCH_LIMIT
) => getUniqueSearches(searches).slice(0, maxItems);

// 저장된 기록이 없으면 빈 목록으로 시작한다. 예시 검색어를 미리 채워 두면
// 사용자가 검색한 적 없는 값이 '최근 검색'으로 보인다.
export const getStoredRecentSearches = ({
  storageKey,
  maxItems = DEFAULT_RECENT_SEARCH_LIMIT,
}: RecentSearchStorageOptions) => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedSearches = window.localStorage.getItem(storageKey);

    if (!storedSearches) {
      return [];
    }

    const parsedSearches: unknown = JSON.parse(storedSearches);

    if (!Array.isArray(parsedSearches)) {
      return [];
    }

    return limitRecentSearches(
      parsedSearches.filter(
        (search): search is string =>
          typeof search === 'string' && search.trim().length > 0
      ),
      maxItems
    );
  } catch {
    return [];
  }
};

export const saveRecentSearches = (
  searches: readonly string[],
  { storageKey }: RecentSearchStorageOptions
) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(searches));
  } catch {
    return;
  }
};

export const addStoredRecentSearch = (
  keyword: string,
  options: AddRecentSearchOptions
) => {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return options.currentSearches
      ? limitRecentSearches(options.currentSearches, options.maxItems)
      : getStoredRecentSearches(options);
  }

  const maxItems = options.maxItems ?? DEFAULT_RECENT_SEARCH_LIMIT;
  const currentSearches =
    options.currentSearches ?? getStoredRecentSearches(options);
  const nextSearches = limitRecentSearches([
    trimmedKeyword,
    ...currentSearches.filter((search) => search !== trimmedKeyword),
  ], maxItems);

  saveRecentSearches(nextSearches, options);

  return nextSearches;
};

export const removeStoredRecentSearch = (
  keyword: string,
  options: AddRecentSearchOptions
) => {
  const currentSearches =
    options.currentSearches ?? getStoredRecentSearches(options);
  const nextSearches = currentSearches.filter((search) => search !== keyword);

  saveRecentSearches(nextSearches, options);

  return nextSearches;
};
