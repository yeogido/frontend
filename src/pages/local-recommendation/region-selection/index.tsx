import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getPopularRegions, searchRegions } from '../../../apis/regions.api';
import { LoadingSpinner } from '../../../components/common';
import { ResponsivePageShell } from '../../../components/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';

import BackButton from '../components/BackButton';
import {
  NeighborhoodSearchSection,
  PopularRegionGrid,
  RecentSearchSection,
  SelectedNeighborhoodCard,
} from './components';
import type { Neighborhood } from './types';
import { useRecentRegions } from './useRecentRegions';
import { fromRegion, fromSearchResult } from './utils';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_BOTTOM = 32;
const MAIN_PADDING_TOP = 48;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 52;
const BUTTON_RADIUS = 12;
const BUTTON_TEXT_SIZE = 14;

function LocalRecommendationPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const draftNeighborhood = useLocalRecommendationStore(
    (state) => state.draft.neighborhood
  );
  const setNeighborhood = useLocalRecommendationStore(
    (state) => state.setNeighborhood
  );
  const { recentRegions, addRecentRegion } = useRecentRegions();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
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

  // 검색창에 입력하는 즉시(타이핑마다) 백엔드에 물어 연관 검색어를 채운다.
  // 백엔드가 이름 LIKE(부분 문자열) 매칭이라 SearchBar의 로컬 재필터를
  // 그대로 통과하므로, 이 목록을 suggestions로 넘기기만 하면 된다.
  const searchResultsQuery = useQuery({
    queryKey: ['regions', 'search', trimmedSearchQuery],
    queryFn: () => searchNeighborhoods(trimmedSearchQuery),
    enabled: trimmedSearchQuery.length > 0,
    staleTime: 30_000,
  });

  const searchSuggestions = searchResultsQuery.data?.map((n) => n.name) ?? [];

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  // 추천 목록에서 클릭했거나(정확한 이름이 그대로 들어옴) 검색어를 그대로
  // 입력해 제출한 경우, 현재 검색 결과 중 이름이 일치하는 지역을 선택한다.
  // 아직 응답이 없는 상태(빠른 타이핑 후 즉시 Enter)라면 결과를 기다렸다가
  // 판단해서, 유효한 일치 결과를 조용히 놓치지 않도록 한다.
  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const results =
      trimmedQuery === trimmedSearchQuery && searchResultsQuery.data
        ? searchResultsQuery.data
        : await queryClient.fetchQuery({
            queryKey: ['regions', 'search', trimmedQuery],
            queryFn: () => searchNeighborhoods(trimmedQuery),
            staleTime: 30_000,
          });

    const matched = results.find(
      (neighborhood) => neighborhood.name === trimmedQuery
    );

    if (matched) {
      handleSelectNeighborhood(matched);
    }
  };

  const handleSelectNeighborhood = (candidate: Neighborhood) => {
    setSearchQuery('');

    if (selectedNeighborhood?.id === candidate.id) {
      setSelectedNeighborhood(null);
      setNeighborhood(null);
      return;
    }

    setSelectedNeighborhood(candidate);
    setNeighborhood(candidate);
    addRecentRegion(candidate);
  };

  const handleClearSelection = () => {
    setSelectedNeighborhood(null);
    setNeighborhood(null);
  };

  return (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={MAIN_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      <BackButton onClick={() => navigate('/local-course')} />
      <main className="flex-1">
        <NeighborhoodSearchSection
          suggestions={searchSuggestions}
          onSearch={handleSearch}
          onQueryChange={handleQueryChange}
        />

        {selectedNeighborhood && !searchQuery.trim() ? (
          <SelectedNeighborhoodCard
            neighborhood={selectedNeighborhood}
            onClear={handleClearSelection}
          />
        ) : null}

        {!searchQuery.trim() && !selectedNeighborhood ? (
          <RecentSearchSection
            neighborhoods={recentRegions}
            onSelect={handleSelectNeighborhood}
          />
        ) : null}

        {regionsQuery.isLoading ? (
          <LoadingSpinner label="지역 정보를 불러오는 중" />
        ) : regionsQuery.isError ? (
          <section aria-live="polite" className="text-center">
            <p>지역 정보를 불러오지 못했습니다.</p>
            <button type="button" onClick={() => regionsQuery.refetch()}>
              다시 시도
            </button>
          </section>
        ) : (
          <PopularRegionGrid
            regions={regionsQuery.data ?? []}
            onSelect={(region) => handleSelectNeighborhood(fromRegion(region))}
          />
        )}
      </main>

      <button
        type="button"
        disabled={!selectedNeighborhood}
        onClick={() => navigate('/local-recommendation/course-info')}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full font-semibold"
        style={{
          marginTop: BUTTON_MARGIN_TOP * scale,
          height: BUTTON_HEIGHT * scale,
          borderRadius: BUTTON_RADIUS * scale,
          fontSize: BUTTON_TEXT_SIZE * scale,
        }}
      >
        기본 정보 입력하기
      </button>
    </ResponsivePageShell>
  );
}

export default LocalRecommendationPage;
