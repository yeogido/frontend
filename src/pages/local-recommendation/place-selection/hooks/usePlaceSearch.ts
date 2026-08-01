import { useEffect, useRef, useState } from 'react';

import { searchPlaces } from '../placeSearch';
import type { PlaceItem } from '../types';

const SEARCH_DEBOUNCE_MS = 300;

export function usePlaceSearch() {
  const [query, setQueryState] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      return;
    }

    let isCancelled = false;

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(query);
        if (!isCancelled) {
          setSearchResults(results);
        }
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const setQuery = (nextQuery: string) => {
    setQueryState(nextQuery);

    if (!nextQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
  };

  return {
    query,
    setQuery,
    searchResults,
    isLoading,
  };
}
