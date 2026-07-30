import { useMemo, useState, type FormEvent } from 'react';

import {
  addStoredRecentSearch,
  getStoredRecentSearches,
  saveRecentSearches,
} from '../../../../utils/recentSearches';
import { useTravelRecordRegionSearch } from '../../../../hooks/useTravelRecordRegions';
import {
  getTravelRecordRegionSuggestions,
  mapRegionSearchToTravelRecordRegion,
} from '../../mappers/travelRecordApiMapper';
import {
  filterTravelMapSelectableRegions,
  normalizeTravelMapSelectedRegion,
} from '../../constants/travelRecordRegionCodes';

import {
  MAX_VISIBLE_REGION_SUGGESTIONS,
  recentSearchStorageOptions,
} from '../constants';
import type { TravelRecordRegion } from '../types';

function useTravelRecordRegionSelection(
  popularRegions: readonly TravelRecordRegion[],
  initialSelectedRegion: TravelRecordRegion | null = null,
) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    getStoredRecentSearches(recentSearchStorageOptions),
  );
  const [selectedRegion, setSelectedRegion] =
    useState<TravelRecordRegion | null>(initialSelectedRegion);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const regionSearchQuery = useTravelRecordRegionSearch(
    selectedRegion ? '' : query,
  );
  const searchedRegions = useMemo(
    () =>
      filterTravelMapSelectableRegions(regionSearchQuery.data ?? []).map(
        mapRegionSearchToTravelRecordRegion,
      ),
    [regionSearchQuery.data],
  );

  const displayedPopularRegions = popularRegions;

  const visibleSuggestions = useMemo(() => {
    return getTravelRecordRegionSuggestions({
      query,
      popularRegions,
      searchedRegions,
      selectedRegion,
    })
      .slice(0, MAX_VISIBLE_REGION_SUGGESTIONS);
  }, [popularRegions, query, searchedRegions, selectedRegion]);

  const addRecentSearch = (keyword: string) => {
    const nextSearches = addStoredRecentSearch(keyword, {
      ...recentSearchStorageOptions,
      currentSearches: recentSearches,
    });

    setRecentSearches(nextSearches);
  };

  const selectRegion = (region: TravelRecordRegion) => {
    const selectedTravelMapRegion = normalizeTravelMapSelectedRegion(region);

    setSelectedRegion(selectedTravelMapRegion);
    setQuery(selectedTravelMapRegion.selectionName);
    setIsSuggestionOpen(false);
    addRecentSearch(selectedTravelMapRegion.selectionName);
  };

  const selectRegionName = (regionName: string) => {
    const region = [...searchedRegions, ...popularRegions].find(
      (region) =>
        region.name === regionName ||
        region.province === regionName ||
        region.selectionName === regionName,
    );

    if (region) {
      selectRegion(region);
    }
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

    const firstSuggestion = visibleSuggestions[0];

    if (firstSuggestion) {
      selectRegionName(firstSuggestion);
    }
  };

  return {
    filteredRegions: displayedPopularRegions,
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
