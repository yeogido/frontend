import { useMemo, useState, type FormEvent } from 'react';

import {
  addStoredRecentSearch,
  getStoredRecentSearches,
  saveRecentSearches,
} from '../../../../utils/recentSearches';

import {
  createSelectedRegionFromSuggestion,
  findRegionByName,
  getRegionSearchText,
  MAX_VISIBLE_REGION_SUGGESTIONS,
  normalizeSearchText,
  popularRegions,
  recentSearchStorageOptions,
  searchSuggestions,
} from '../constants';
import type { TravelRecordRegion } from '../types';

function useTravelRecordRegionSelection() {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    getStoredRecentSearches(recentSearchStorageOptions),
  );
  const [selectedRegion, setSelectedRegion] =
    useState<TravelRecordRegion | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const filteredRegions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());

    if (!normalizedQuery || selectedRegion) {
      return popularRegions;
    }

    return popularRegions.filter((region) =>
      getRegionSearchText(region).includes(normalizedQuery),
    );
  }, [query, selectedRegion]);

  const visibleSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());

    if (!normalizedQuery || selectedRegion) {
      return [];
    }

    return searchSuggestions
      .filter((suggestion) =>
        normalizeSearchText(suggestion).includes(normalizedQuery),
      )
      .slice(0, MAX_VISIBLE_REGION_SUGGESTIONS);
  }, [query, selectedRegion]);

  const addRecentSearch = (keyword: string) => {
    const nextSearches = addStoredRecentSearch(keyword, {
      ...recentSearchStorageOptions,
      currentSearches: recentSearches,
    });

    setRecentSearches(nextSearches);
  };

  const selectRegion = (region: TravelRecordRegion) => {
    setSelectedRegion(region);
    setQuery(region.selectionName);
    setIsSuggestionOpen(false);
    addRecentSearch(region.selectionName);
  };

  const selectRegionName = (regionName: string) => {
    selectRegion(
      findRegionByName(regionName) ??
        createSelectedRegionFromSuggestion(regionName),
    );
  };

  const updateQuery = (nextQuery: string) => {
    setSelectedRegion(null);
    setQuery(nextQuery);
    setIsSuggestionOpen(nextQuery.trim().length > 0);
  };

  const openSuggestions = () => {
    setIsSuggestionOpen(query.trim().length > 0);
  };

  const removeRecentSearch = (targetIndex: number) => {
    const nextSearches = recentSearches.filter(
      (_, index) => index !== targetIndex,
    );

    saveRecentSearches(nextSearches, recentSearchStorageOptions);
    setRecentSearches(nextSearches);
  };

  const clearRecentSearches = () => {
    saveRecentSearches([], recentSearchStorageOptions);
    setRecentSearches([]);
  };

  const clearSelectedRegion = () => {
    setSelectedRegion(null);
    setQuery('');
    setIsSuggestionOpen(false);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (filteredRegions.length > 0) {
      selectRegion(filteredRegions[0]);
    }
  };

  return {
    filteredRegions,
    isSuggestionOpen,
    query,
    recentSearches,
    selectedRegion,
    visibleSuggestions,
    clearRecentSearches,
    clearSelectedRegion,
    openSuggestions,
    removeRecentSearch,
    selectRegion,
    selectRegionName,
    submitSearch,
    updateQuery,
  };
}

export default useTravelRecordRegionSelection;
