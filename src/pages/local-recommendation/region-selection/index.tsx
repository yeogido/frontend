import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getPopularRegions, searchRegions } from '../../../apis/regions.api';
import { LoadingSpinner } from '../../../components/common';
import { RegionSelectionLayout } from '../../../components/region-selection';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';
import {
  PopularRegionGrid,
  RecentSearchSection,
  RegionSearchInput,
  RegionSuggestionList,
  SelectedRegionSearchBar,
} from '../../travel-record/region-selection/components';
import { mapPopularRegionToTravelRecordRegion } from '../../travel-record/mappers/travelRecordApiMapper';

import type { Neighborhood } from './types';
import { useRecentRegions } from './useRecentRegions';
import {
  fromRegion,
  fromSearchResult,
  getNeighborhoodLabel,
} from './utils';

function LocalRecommendationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const draftNeighborhood = useLocalRecommendationStore(
    (state) => state.draft.neighborhood,
  );
  const setNeighborhood = useLocalRecommendationStore(
    (state) => state.setNeighborhood,
  );
  const {
    recentRegions,
    addRecentRegion,
    clearRecentRegions,
    removeRecentRegion,
  } = useRecentRegions();
  const [searchQuery, setSearchQuery] = useState('');
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
    (await searchRegions(query)).map(fromSearchResult);
  const searchResultsQuery = useQuery({
    queryKey: ['regions', 'search', trimmedSearchQuery],
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
  const searchSuggestions =
    searchResultsQuery.data?.map((region) => region.name) ?? [];

  const handleSelectNeighborhood = (candidate: Neighborhood) => {
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

    const results =
      trimmedQuery === trimmedSearchQuery && searchResultsQuery.data
        ? searchResultsQuery.data
        : await queryClient.fetchQuery({
            queryKey: ['regions', 'search', trimmedQuery],
            queryFn: () => searchNeighborhoods(trimmedQuery),
            staleTime: 30_000,
          });
    const matched = results.find((region) => region.name === trimmedQuery);

    if (matched) handleSelectNeighborhood(matched);
  };

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
    setIsSuggestionOpen(query.trim().length > 0);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setIsSuggestionOpen(false);
    void handleSearch(suggestion);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSearch(searchQuery);
  };

  return (
    <RegionSelectionLayout
      onBack={() => navigate('/local-course')}
      backAriaLabel="이전 화면으로 돌아가기"
      title={<>어디를<br />추천하시겠어요?</>}
      description="코스를 등록할 지역을 검색하거나 선택해 주세요."
      search={
        <form role="search" onSubmit={handleSearchSubmit} className="relative">
          {selectedRegion ? (
            <SelectedRegionSearchBar
              region={selectedRegion}
              onClear={() => {
                setSelectedNeighborhood(null);
                setNeighborhood(null);
              }}
            />
          ) : (
            <RegionSearchInput
              query={searchQuery}
              onQueryChange={handleQueryChange}
              onFocus={() => setIsSuggestionOpen(searchQuery.trim().length > 0)}
            />
          )}
          {!selectedRegion && isSuggestionOpen ? (
            <RegionSuggestionList
              query={searchQuery}
              suggestions={searchSuggestions}
              onSelect={handleSuggestionSelect}
            />
          ) : null}
        </form>
      }
      recentSearches={
        <RecentSearchSection
          searches={recentRegions.map(getNeighborhoodLabel)}
          onClear={clearRecentRegions}
          onRemove={(index) => {
            const region = recentRegions[index];
            if (region) removeRecentRegion(region.id);
          }}
          onSelect={(label) => {
            const region = recentRegions.find(
              (item) => getNeighborhoodLabel(item) === label,
            );
            if (region) handleSelectNeighborhood(region);
          }}
        />
      }
      popularRegions={
        regionsQuery.isLoading ? (
          <div className="mt-8 flex justify-center"><LoadingSpinner label="인기 지역을 불러오는 중" /></div>
        ) : regionsQuery.isError ? (
          <section aria-live="polite" className="mt-8 text-center text-[14px] text-[#505050]">
            인기 지역을 불러오지 못했습니다.
          </section>
        ) : (
          <PopularRegionGrid
            regions={popularRegions}
            selectedRegionId={selectedRegion?.id}
            onSelect={(region) => {
              const candidate = regionsQuery.data?.find(
                (item) => item.regionId === region.regionId,
              );
              if (candidate) handleSelectNeighborhood(fromRegion(candidate));
            }}
          />
        )
      }
      action={
        <button
          type="button"
          disabled={!selectedNeighborhood}
          onClick={() => navigate('/local-recommendation/course-info')}
          className="bg-gray-2 text-gray-4 enabled:bg-main-5 flex h-[53px] w-full items-center justify-center rounded-xl text-[18px] leading-none font-semibold enabled:text-white"
        >
          기본 정보 입력하기
        </button>
      }
    />
  );
}

export default LocalRecommendationPage;
