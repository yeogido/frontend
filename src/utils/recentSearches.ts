interface RecentSearchStorageOptions {
  storageKey: string;
  fallbackSearches?: readonly string[];
  maxItems?: number;
}

const DEFAULT_RECENT_SEARCH_LIMIT = 10;

export const getUniqueSearches = (searches: readonly string[]) => [
  ...new Set(searches),
];

export const getStoredRecentSearches = ({
  storageKey,
  fallbackSearches = [],
}: RecentSearchStorageOptions) => {
  const fallbackUniqueSearches = getUniqueSearches(fallbackSearches);

  if (typeof window === 'undefined') {
    return fallbackUniqueSearches;
  }

  try {
    const storedSearches = window.localStorage.getItem(storageKey);

    if (!storedSearches) {
      return fallbackUniqueSearches;
    }

    const parsedSearches: unknown = JSON.parse(storedSearches);

    if (!Array.isArray(parsedSearches)) {
      return fallbackUniqueSearches;
    }

    return getUniqueSearches(
      parsedSearches.filter(
        (search): search is string =>
          typeof search === 'string' && search.trim().length > 0
      )
    );
  } catch {
    return fallbackUniqueSearches;
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
  options: RecentSearchStorageOptions
) => {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return getStoredRecentSearches(options);
  }

  const currentSearches = getStoredRecentSearches(options);
  const maxItems = options.maxItems ?? DEFAULT_RECENT_SEARCH_LIMIT;
  const nextSearches = getUniqueSearches([
    trimmedKeyword,
    ...currentSearches.filter((search) => search !== trimmedKeyword),
  ]).slice(0, maxItems);

  saveRecentSearches(nextSearches, options);

  return nextSearches;
};
