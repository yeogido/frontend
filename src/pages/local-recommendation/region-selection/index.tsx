import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  getRegions,
  getSubRegions,
  searchRegions,
} from '../../../apis/regions.api';
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
import { fromRegion, fromSearchResult, fromSubRegion } from './utils';

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
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<Neighborhood | null>(draftNeighborhood);
  // Sub-regions of the last picked node, when it turned out not to be a
  // leaf — lets picking recurse to any depth the backend later adds.
  const [drillParent, setDrillParent] = useState<Neighborhood | null>(null);
  const [drillOptions, setDrillOptions] = useState<Neighborhood[]>([]);

  const regionsQuery = useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
    staleTime: 5 * 60_000,
  });

  const trimmedQuery = searchQuery.trim();
  const searchResultsQuery = useQuery({
    queryKey: ['regions', 'search', trimmedQuery],
    queryFn: async () =>
      (await searchRegions(trimmedQuery)).map(fromSearchResult),
    enabled: trimmedQuery.length > 0,
    staleTime: 30_000,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedNeighborhood(null);
    setDrillParent(null);
    setDrillOptions([]);
  };

  const handleSelectNeighborhood = async (candidate: Neighborhood) => {
    setSearchQuery('');

    if (selectedNeighborhood?.id === candidate.id) {
      setSelectedNeighborhood(null);
      setNeighborhood(null);
      return;
    }

    const subRegions = await getSubRegions(candidate.id);

    if (subRegions.length > 0) {
      setDrillParent(candidate);
      setDrillOptions(
        subRegions.map((subRegion) => fromSubRegion(subRegion, candidate.name))
      );
      setSelectedNeighborhood(null);
      setNeighborhood(null);
      return;
    }

    setDrillParent(null);
    setDrillOptions([]);
    setSelectedNeighborhood(candidate);
    setNeighborhood(candidate);
    addRecentRegion(candidate);
  };

  const handleClearSelection = () => {
    setSelectedNeighborhood(null);
    setNeighborhood(null);
  };

  const isBrowsingResults = trimmedQuery.length > 0 || drillOptions.length > 0;

  return (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={MAIN_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-background"
    >
      <main className="flex-1">
        <NeighborhoodSearchSection onSearch={handleSearch} />

        {selectedNeighborhood && !isBrowsingResults ? (
          <SelectedNeighborhoodCard
            neighborhood={selectedNeighborhood}
            onClear={handleClearSelection}
          />
        ) : drillOptions.length > 0 ? (
          <NeighborhoodResultList
            heading={`${drillParent?.name ?? ''} 하위 지역`}
            results={drillOptions}
            selectedNeighborhood={selectedNeighborhood}
            onSelect={handleSelectNeighborhood}
          />
        ) : trimmedQuery ? (
          <NeighborhoodResultList
            heading="검색 결과"
            results={searchResultsQuery.data ?? []}
            selectedNeighborhood={selectedNeighborhood}
            onSelect={handleSelectNeighborhood}
          />
        ) : null}

        {!isBrowsingResults && !selectedNeighborhood ? (
          <RecentSearchSection
            neighborhoods={recentRegions}
            onSelect={handleSelectNeighborhood}
          />
        ) : null}

        <PopularRegionGrid
          regions={regionsQuery.data?.regions ?? []}
          onSelect={(region) => handleSelectNeighborhood(fromRegion(region))}
        />
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
