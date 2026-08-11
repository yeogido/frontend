import { useMemo, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { searchRegions } from '../../../../apis/regions.api';
import {
  addStoredRecentSearch,
  getStoredRecentSearches,
  saveRecentSearches,
} from '../../../../utils/recentSearches';
import { useTravelRecordRegionSearch } from '../../../../hooks/useTravelRecordRegions';
import { mapRegionSearchToTravelRecordRegion } from '../../mappers/travelRecordApiMapper';
import {
  filterTravelMapSelectableRegions,
  normalizeTravelMapSelectedRegion,
} from '../../constants/travelRecordRegionCodes';

import {
  MAX_VISIBLE_REGION_SUGGESTIONS,
  recentSearchStorageOptions,
} from '../constants';
import {
  findTravelRecordRegionByName,
  resolveTravelRecordRegionFromSearch,
} from '../recentSearchRegion';
import { getTravelRecordRegionSuggestions } from '../regionSuggestions';
import type { TravelRecordRegion } from '../types';

function useTravelRecordRegionSelection(
  initialSelectedRegion: TravelRecordRegion | null = null,
) {
  const queryClient = useQueryClient();
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

  const visibleSuggestions = useMemo(() => {
    return getTravelRecordRegionSuggestions({
      query,
      searchedRegions,
      selectedRegion,
    }).slice(0, MAX_VISIBLE_REGION_SUGGESTIONS);
  }, [query, searchedRegions, selectedRegion]);

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

  // 최근 검색 칩을 누를 때는 검색창이 비어 있어 화면에 올라와 있는 검색 결과가
  // 없다. 이름으로 지역 검색을 한 번 더 해서 선택까지 이어지게 한다.
  const selectSearchedRegionName = async (regionName: string) => {
    const keyword = regionName.trim();

    if (!keyword) {
      return;
    }

    try {
      const searchResults = await queryClient.fetchQuery({
        queryKey: ['travelRecordRegions', 'search', keyword],
        queryFn: () => searchRegions(keyword),
      });
      const region = resolveTravelRecordRegionFromSearch(
        searchResults,
        keyword,
      );

      if (region) {
        selectRegion(region);
      }
    } catch {
      // 검색에 실패하면 선택을 바꾸지 않고 그대로 둔다.
    }
  };

  const selectRegionName = (regionName: string) => {
    const region = findTravelRecordRegionByName(searchedRegions, regionName);

    if (region) {
      selectRegion(region);

      return;
    }

    void selectSearchedRegionName(regionName);
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
    isSuggestionOpen,
    query,
    recentSearches,
    selectedRegion,
    visibleSuggestions,
    clearRecentSearches,
    clearSelectedRegion,
    openSuggestions,
    removeRecentSearch,
    selectRegionName,
    submitSearch,
    updateQuery,
  };
}

export default useTravelRecordRegionSelection;
