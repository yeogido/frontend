import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { searchRegions } from '../../../../apis/regions.api';
import {
  addStoredRecentSearch,
  getStoredRecentSearches,
  saveRecentSearches,
} from '../../../../utils/recentSearches';
import { useRegions } from '../../../../hooks/useRegions';
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
  // 광역시 산하 구를 상위 광역시로 올릴 때 그 지역의 id가 필요하다.
  // 하드코딩하면 백엔드가 ID를 재부여했을 때 엉뚱한 지역에 저장된다.
  const { data: regionsData } = useRegions();
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

  /**
   * 지역 선택이 바뀔 때마다 올라가는 번호.
   *
   * 뒤늦게 도착한 지역 검색 응답이 그 사이의 선택을 덮어쓰지 않도록, 응답을
   * 반영하기 전에 자기 세대가 아직 최신인지 확인하는 데 쓴다.
   */
  const selectionGenerationRef = useRef(0);

  const beginSelectionChange = () => {
    selectionGenerationRef.current += 1;

    return selectionGenerationRef.current;
  };

  const selectRegion = (region: TravelRecordRegion) => {
    const selectedTravelMapRegion = normalizeTravelMapSelectedRegion(
      region,
      regionsData?.regions,
    );

    setSelectedRegion(selectedTravelMapRegion);
    setQuery(selectedTravelMapRegion.selectionName);
    setIsSuggestionOpen(false);
    addRecentSearch(selectedTravelMapRegion.selectionName);
  };

  // 최근 검색 칩을 누를 때는 검색창이 비어 있어 화면에 올라와 있는 검색 결과가
  // 없다. 이름으로 지역 검색을 한 번 더 해서 선택까지 이어지게 한다.
  //
  // 칩을 연달아 누르면 응답이 누른 순서대로 온다는 보장이 없다. 먼저 보낸
  // 요청이 늦게 도착하면 그 사이에 고른 지역을 덮어쓰므로, 선택을 바꾸는
  // 조작마다 세대를 올려 두고 뒤늦게 온 응답은 버린다.
  const selectSearchedRegionName = async (
    regionName: string,
    generation: number,
  ) => {
    const keyword = regionName.trim();

    if (!keyword) {
      return;
    }

    try {
      const searchResults = await queryClient.fetchQuery({
        queryKey: ['travelRecordRegions', 'search', keyword],
        queryFn: () => searchRegions(keyword),
      });

      if (selectionGenerationRef.current !== generation) {
        return;
      }

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
    const generation = beginSelectionChange();
    const region = findTravelRecordRegionByName(searchedRegions, regionName);

    if (region) {
      selectRegion(region);

      return;
    }

    void selectSearchedRegionName(regionName, generation);
  };

  const updateQuery = (nextQuery: string) => {
    beginSelectionChange();
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
    beginSelectionChange();
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
