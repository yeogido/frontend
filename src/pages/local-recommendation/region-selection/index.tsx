import { useMemo, useState } from 'react';

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

function LocalRecommendationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<Neighborhood | null>(null);
  const [, setIsComplete] = useState(false);

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
    <div className="bg-background mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-8">
      <main className="flex-1 pt-10">
        <NeighborhoodSearchSection onSearch={handleSearch} />
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
        onClick={() => setIsComplete(true)}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 mt-8 h-13 w-full rounded-xl text-sm font-semibold"
      >
        기본 정보 입력하기
      </button>
    </div>
  );
}

export default LocalRecommendationPage;
