import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

import {
  NeighborhoodResultList,
  NeighborhoodSearchSection,
  PopularRegionGrid,
  RecentSearchSection,
  SelectedNeighborhoodCard,
} from './components';
import {
  popularRegions,
  recentNeighborhoodIds,
} from './constants/featuredRegions';
import { neighborhoods } from './constants/neighborhoods';
import type { Neighborhood } from './types';
import { filterNeighborhoods } from './utils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<Neighborhood | null>(null);

  const searchResults = useMemo(
    () => filterNeighborhoods(neighborhoods, searchQuery),
    [searchQuery]
  );

  const recentNeighborhoods = useMemo(
    () =>
      recentNeighborhoodIds.flatMap((id) => {
        const neighborhood = neighborhoods.find((item) => item.id === id);
        return neighborhood ? [neighborhood] : [];
      }),
    []
  );

  const neighborhoodSearchSuggestions = useMemo(
    () => [
      ...new Set(
        neighborhoods.flatMap((neighborhood) => [
          neighborhood.province,
          neighborhood.city,
          neighborhood.district,
          `${neighborhood.city} ${neighborhood.district}`,
        ])
      ),
    ],
    []
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedNeighborhood(null);
  };

  const handleSelectNeighborhood = (clickedNeighborhood: Neighborhood) => {
    setSearchQuery(''); // 검색어 초기화
    // 이미 선택된 동네의 ID와 방금 클릭한 동네의 ID가 같은지 확인
    if (selectedNeighborhood?.id === clickedNeighborhood.id) {
      // 같다면 선택 해제 (state를 null로 변경)
      setSelectedNeighborhood(null);
    } else {
      // 다르다면 새로운 동네로 업데이트
      setSelectedNeighborhood(clickedNeighborhood);
    }
  };

  return (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={MAIN_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-background"
    >
      <main className="flex-1">
        <NeighborhoodSearchSection
          suggestions={neighborhoodSearchSuggestions}
          onSearch={handleSearch}
        />
        {selectedNeighborhood && !searchQuery ? (
          <SelectedNeighborhoodCard
            neighborhood={selectedNeighborhood}
            onClear={() => setSelectedNeighborhood(null)}
          />
        ) : (
          <NeighborhoodResultList
            query={searchQuery}
            results={searchResults}
            selectedNeighborhood={selectedNeighborhood}
            onSelect={handleSelectNeighborhood}
          />
        )}

        {!searchQuery && !selectedNeighborhood ? (
          <RecentSearchSection
            neighborhoods={recentNeighborhoods}
            onSelect={handleSelectNeighborhood}
          />
        ) : null}
        <PopularRegionGrid
          regions={popularRegions}
          neighborhoods={neighborhoods}
          onSelect={handleSelectNeighborhood}
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
