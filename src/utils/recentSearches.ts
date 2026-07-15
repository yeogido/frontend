interface RecentSearchStorageOptions {
  storageKey: string;
  fallbackSearches?: readonly string[];
}

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

  const storedSearches = window.localStorage.getItem(storageKey);

  if (!storedSearches) {
    return fallbackUniqueSearches;
  }

  try {
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

  window.localStorage.setItem(storageKey, JSON.stringify(searches));
};

export const addStoredRecentSearch = (
  keyword: string,
  options: RecentSearchStorageOptions
) => {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return;
  }

  const currentSearches = getStoredRecentSearches(options);
  const nextSearches = getUniqueSearches([
    trimmedKeyword,
    ...currentSearches.filter((search) => search !== trimmedKeyword),
  ]);

  saveRecentSearches(nextSearches, options);
};
