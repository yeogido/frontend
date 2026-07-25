import { useMemo, useState } from 'react';

import { referencePlaces } from '../constants/referencePlaces';
import { filterPlaceItems } from '../placeSearch';

export function usePlaceSearch() {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(
    () => filterPlaceItems(referencePlaces, query),
    [query]
  );

  return {
    query,
    setQuery,
    searchResults,
  };
}
