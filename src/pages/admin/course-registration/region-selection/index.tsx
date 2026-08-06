import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';

import BackButton from '../../../local-recommendation/components/BackButton';
import {
  NeighborhoodSearchSection,
  PopularRegionGrid,
  RecentSearchSection,
  SelectedNeighborhoodCard,
} from '../../../local-recommendation/region-selection/components';
import type { Neighborhood } from '../../../local-recommendation/region-selection/types';
import {
  fromRegion,
  fromSearchResult,
} from '../../../local-recommendation/region-selection/utils';
import { mockPopularRegions, searchMockRegions } from '../constants/mockRegions';
import { useRecentCourseRegions } from './useRecentCourseRegions';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_BOTTOM = 32;
const MAIN_PADDING_TOP = 48;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 52;
const BUTTON_RADIUS = 12;
const BUTTON_TEXT_SIZE = 14;

function AdminCourseRegionSelectionPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const setRegionInStore = useAdminCourseRegistrationStore(
    (state) => state.setRegion
  );
  const { recentRegions, addRecentRegion } = useRecentCourseRegions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Neighborhood | null>(
    region
  );

  const trimmedSearchQuery = searchQuery.trim();
  // SearchBar가 suggestions를 통째로 받아 내부에서 직접 필터링하는 구조라,
  // 여기서 미리 걸러서 넘기면 필터 결과가 0개일 때 suggestions 배열 자체가
  // 비어버려 SearchBar가 "검색 결과가 없습니다" 안내조차 렌더링하지 않는다.
  // 항상 전체 목록을 넘기고 필터링은 SearchBar에 맡긴다.
  const searchSuggestions = mockPopularRegions.map((region) => region.name);

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectNeighborhood = (candidate: Neighborhood) => {
    setSearchQuery('');

    if (selectedRegion?.id === candidate.id) {
      setSelectedRegion(null);
      setRegionInStore(null);
      return;
    }

    setSelectedRegion(candidate);
    setRegionInStore(candidate);
    addRecentRegion(candidate);
  };

  const handleClearSelection = () => {
    setSelectedRegion(null);
    setRegionInStore(null);
  };

  const handleSearch = (query: string) => {
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    const matched = searchMockRegions(trimmed).find(
      (result) => result.name === trimmed
    );

    if (matched) {
      handleSelectNeighborhood(fromSearchResult(matched));
    }
  };

  return (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={MAIN_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      <BackButton onClick={() => navigate('/admin/courses')} />
      <main className="flex-1">
        <NeighborhoodSearchSection
          suggestions={searchSuggestions}
          onSearch={handleSearch}
          onQueryChange={handleQueryChange}
        />

        {selectedRegion && !trimmedSearchQuery ? (
          <SelectedNeighborhoodCard
            neighborhood={selectedRegion}
            onClear={handleClearSelection}
          />
        ) : null}

        {!trimmedSearchQuery && !selectedRegion ? (
          <RecentSearchSection
            neighborhoods={recentRegions}
            onSelect={handleSelectNeighborhood}
          />
        ) : null}

        <PopularRegionGrid
          regions={mockPopularRegions}
          onSelect={(region) => handleSelectNeighborhood(fromRegion(region))}
        />
      </main>

      <button
        type="button"
        disabled={!selectedRegion}
        onClick={() => navigate('/admin/course-registration/basic-info')}
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

export default AdminCourseRegionSelectionPage;
