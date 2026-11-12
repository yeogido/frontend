import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getPopularRegions, searchRegions } from '../../../apis/regions.api';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';
import { mapPopularRegionToTravelRecordRegion } from '../../travel-record/mappers/travelRecordApiMapper';

import type { Neighborhood } from './types';
import { useRecentRegions } from './useRecentRegions';
import {
  fromRegion,
  fromSearchResult,
  getNeighborhoodLabel,
  sortNeighborhoodsByRelevance,
  toRegionSearchSuggestions,
} from './utils';

/**
 * 지역 선택 화면의 검색·선택·최근 검색·인기 지역 상태와 이동. 모바일과
 * 데스크톱 뷰가 생김새만 다르고 흐름은 같아서 여기 한 곳에 둔다.
 */
export function useRegionSelection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const draftNeighborhood = useLocalRecommendationStore(
    (state) => state.draft.neighborhood
  );
  const setNeighborhood = useLocalRecommendationStore(
    (state) => state.setNeighborhood
  );
  const {
    recentRegions,
    addRecentRegion,
    clearRecentRegions,
    removeRecentRegion,
  } = useRecentRegions();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(false);
  const searchVersionRef = useRef(0);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<Neighborhood | null>(draftNeighborhood);

  const regionsQuery = useQuery({
    queryKey: ['regions', 'popular'],
    queryFn: getPopularRegions,
    staleTime: 5 * 60_000,
  });
  const trimmedSearchQuery = searchQuery.trim();
  const searchNeighborhoods = async (query: string) =>
    sortNeighborhoodsByRelevance(
      (await searchRegions(query)).map(fromSearchResult),
      query
    );
  // 키에 neighborhoods를 넣어 RegionSearchResult[]를 캐싱하는 지역 검색창과
  // 갈라 둔다. 같은 키를 쓰면 서로의 캐시를 읽어 모양이 다른 객체가 오고
  // (Neighborhood에는 fullName이, RegionSearchResult에는 id가 없다) 필드가
  // undefined가 되어 터지거나 엉뚱한 항목이 선택된다.
  const searchResultsQuery = useQuery({
    queryKey: ['regions', 'search', 'neighborhoods', trimmedSearchQuery],
    queryFn: () => searchNeighborhoods(trimmedSearchQuery),
    enabled: trimmedSearchQuery.length > 0,
    staleTime: 30_000,
  });
  const popularRegions =
    regionsQuery.data?.map(mapPopularRegionToTravelRecordRegion) ?? [];
  const selectedRegion = selectedNeighborhood
    ? {
        id: String(selectedNeighborhood.id),
        regionId: selectedNeighborhood.id,
        name: selectedNeighborhood.name,
        province: selectedNeighborhood.parentName,
        selectionName: selectedNeighborhood.name,
        imageSrc: '',
      }
    : null;
  const searchSuggestions = toRegionSearchSuggestions(
    searchResultsQuery.data ?? []
  );

  const handleSelectNeighborhood = (candidate: Neighborhood) => {
    searchVersionRef.current += 1;
    setSearchError(false);
    setSearchQuery('');
    setIsSuggestionOpen(false);

    if (selectedNeighborhood?.id === candidate.id) {
      setSelectedNeighborhood(null);
      setNeighborhood(null);
      return;
    }

    setSelectedNeighborhood(candidate);
    setNeighborhood(candidate);
    addRecentRegion(candidate);
  };

  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const version = ++searchVersionRef.current;
    setSearchError(false);
    try {
      const results =
        trimmedQuery === trimmedSearchQuery && searchResultsQuery.data
          ? searchResultsQuery.data
          : await queryClient.fetchQuery({
              queryKey: ['regions', 'search', 'neighborhoods', trimmedQuery],
              queryFn: () => searchNeighborhoods(trimmedQuery),
              staleTime: 30_000,
            });
      const firstResult = results[0];

      if (version === searchVersionRef.current && firstResult)
        handleSelectNeighborhood(firstResult);
    } catch {
      if (version === searchVersionRef.current) setSearchError(true);
    }
  };

  const handleQueryChange = (query: string) => {
    searchVersionRef.current += 1;
    setSearchError(false);
    setSearchQuery(query);
    setIsSuggestionOpen(query.trim().length > 0);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setIsSuggestionOpen(false);

    const selectedSuggestion = searchSuggestions.find(
      (item) => item.label === suggestion
    );
    // selectedSuggestion을 못 찾았을 때 옵셔널 체이닝 결과가 undefined면
    // id가 undefined인 항목과 맞아떨어져 첫 결과가 잡힌다. 먼저 걸러낸다.
    const candidate =
      selectedSuggestion &&
      searchResultsQuery.data?.find(
        (item) => item.id === selectedSuggestion.regionId
      );

    if (candidate) {
      handleSelectNeighborhood(candidate);
    }
  };

  /** Enter 또는 폼 제출 — 보이는 첫 후보가 있으면 그것을, 없으면 검색해서 첫 결과를 고른다. */
  const handleEnter = () => {
    const firstVisibleResult = searchResultsQuery.data?.[0];

    if (firstVisibleResult) {
      handleSelectNeighborhood(firstVisibleResult);
      return;
    }

    void handleSearch(searchQuery);
  };

  const clearSelectedNeighborhood = () => {
    searchVersionRef.current += 1;
    setSelectedNeighborhood(null);
    setNeighborhood(null);
  };

  const selectRecentByLabel = (label: string) => {
    const region = recentRegions.find(
      (item) => getNeighborhoodLabel(item) === label
    );
    if (region) handleSelectNeighborhood(region);
  };

  const removeRecentByIndex = (index: number) => {
    const region = recentRegions[index];
    if (region) removeRecentRegion(region.id);
  };

  const selectPopularRegion = (regionId: number | undefined) => {
    const candidate = regionsQuery.data?.find(
      (item) => item.regionId === regionId
    );
    if (candidate) handleSelectNeighborhood(fromRegion(candidate));
  };

  return {
    searchQuery,
    searchError: searchError || searchResultsQuery.isError,
    isSuggestionOpen,
    selectedNeighborhood,
    selectedRegion,
    regionsQuery,
    popularRegions,
    searchSuggestions,
    recentLabels: recentRegions.map(getNeighborhoodLabel),
    clearRecentRegions,
    handleQueryChange,
    handleSuggestionSelect,
    handleEnter,
    openSuggestionsIfQuery: () =>
      setIsSuggestionOpen(searchQuery.trim().length > 0),
    clearSelectedNeighborhood,
    selectRecentByLabel,
    removeRecentByIndex,
    selectPopularRegion,
    goNext: () => navigate('/local-recommendation/course-info'),
    goBack: () => navigate('/local-course'),
  };
}
