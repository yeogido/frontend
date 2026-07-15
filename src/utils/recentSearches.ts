interface RecentSearchStorageOptions {
  storageKey: string;
  fallbackSearches?: readonly string[];
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

export const getStoredRecentSearches = ({
  storageKey,
  fallbackSearches = [],
  maxItems = DEFAULT_RECENT_SEARCH_LIMIT,
}: RecentSearchStorageOptions) => {
  const fallbackUniqueSearches = limitRecentSearches(
    fallbackSearches,
    maxItems
  );

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

    return limitRecentSearches(
      parsedSearches.filter(
        (search): search is string =>
          typeof search === 'string' && search.trim().length > 0
      ),
      maxItems
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
