import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getRegions, searchRegions } from '../../../apis/regions.api';
import { LoadingSpinner } from '../../../components/common';
import { ResponsivePageShell } from '../../../components/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';

import {
  NeighborhoodResultList,
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
const MAIN_PADDING_TOP = 40;
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

  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<Neighborhood | null>(draftNeighborhood);

  const regionsQuery = useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
    staleTime: 5 * 60_000,
  });

  const searchResultsQuery = useQuery({
    queryKey: ['regions', 'search', submittedQuery],
    queryFn: async () =>
      (await searchRegions(submittedQuery)).map(fromSearchResult),
    enabled: submittedQuery.length > 0,
    staleTime: 30_000,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSubmittedQuery(query.trim());
    setSelectedNeighborhood(null);
    setNeighborhood(null);
  };

  const handleSelectNeighborhood = (candidate: Neighborhood) => {
    setSearchQuery('');
    setSubmittedQuery('');

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
      className="bg-background"
    >
      <main className="flex-1">
        <NeighborhoodSearchSection onSearch={handleSearch} />

        {selectedNeighborhood && !searchQuery.trim() ? (
          <SelectedNeighborhoodCard
            neighborhood={selectedNeighborhood}
            onClear={handleClearSelection}
          />
        ) : searchQuery.trim() ? (
          searchResultsQuery.isLoading ? (
            <LoadingSpinner label="검색 결과를 불러오는 중" />
          ) : searchResultsQuery.isError ? (
            <section aria-live="polite" className="text-center">
              <p>검색 결과를 불러오지 못했습니다.</p>
              <button
                type="button"
                onClick={() => searchResultsQuery.refetch()}
              >
                다시 시도
              </button>
            </section>
          ) : (
            <NeighborhoodResultList
              heading="검색 결과"
              results={searchResultsQuery.data ?? []}
              selectedNeighborhood={selectedNeighborhood}
              onSelect={handleSelectNeighborhood}
            />
          )
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
            regions={regionsQuery.data?.regions ?? []}
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
