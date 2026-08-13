import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getPopularRegions, searchRegions } from '../../../../apis/regions.api';
import { LoadingSpinner } from '../../../../components/common';
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
import { useRecentCourseRegions } from './useRecentCourseRegions';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_BOTTOM = 32;
const MAIN_PADDING_TOP = 48;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 52;
const BUTTON_RADIUS = 12;
const BUTTON_TEXT_SIZE = 14;
const STATUS_MESSAGE_FONT_SIZE = 14;

function AdminCourseRegionSelectionPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  const setRegionInStore = useAdminCourseRegistrationStore(
    (state) => state.setRegion
  );
  const { recentRegions, addRecentRegion } = useRecentCourseRegions();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');

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
  // Neighborhood[]를 캐싱하므로 RegionSearchResult[]를 쓰는 지역 검색창과
  // 키를 갈라 둔다. 자세한 이유는 local-recommendation/region-selection 참고.
  const searchResultsQuery = useQuery({
    queryKey: ['regions', 'search', 'neighborhoods', trimmedSearchQuery],
    queryFn: () => searchNeighborhoods(trimmedSearchQuery),
    enabled: trimmedSearchQuery.length > 0,
    staleTime: 30_000,
  });

  const searchSuggestions = searchResultsQuery.data?.map((n) => n.name) ?? [];

  // 검색 API가 실패하면 searchSuggestions가 빈 배열이 되어 "결과 없음"과
  // 구분이 안 됐다 - 로딩/에러 상태를 별도로 안내한다.
  const searchStatusMessage = useMemo(() => {
    if (!trimmedSearchQuery) return null;
    if (searchResultsQuery.isFetching) return '지역을 검색하고 있어요...';
    if (searchResultsQuery.isError)
      return '지역을 불러오지 못했어요. 다시 시도해 주세요.';
    return null;
  }, [
    trimmedSearchQuery,
    searchResultsQuery.isFetching,
    searchResultsQuery.isError,
  ]);

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectNeighborhood = (candidate: Neighborhood) => {
    setSearchQuery('');

    if (region?.id === candidate.id) {
      setRegionInStore(null);
      return;
    }

    setRegionInStore(candidate);
    addRecentRegion(candidate);
  };

  const handleClearSelection = () => {
    setRegionInStore(null);
  };

  // 추천 목록에서 클릭했거나(정확한 이름이 그대로 들어옴) 검색어를 그대로
  // 입력해 제출한 경우, 현재 검색 결과 중 이름이 일치하는 지역을 선택한다.
  // 아직 응답이 없는 상태(빠른 타이핑 후 즉시 Enter)라면 결과를 기다렸다가
  // 판단해서, 유효한 일치 결과를 조용히 놓치지 않도록 한다.
  const handleSearch = async (query: string) => {
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    const results =
      trimmed === trimmedSearchQuery && searchResultsQuery.data
        ? searchResultsQuery.data
        : await queryClient.fetchQuery({
            queryKey: ['regions', 'search', 'neighborhoods', trimmed],
            queryFn: () => searchNeighborhoods(trimmed),
            staleTime: 30_000,
          });

    const matched = results.find((neighborhood) => neighborhood.name === trimmed);

    if (matched) {
      handleSelectNeighborhood(matched);
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
          statusMessage={
            searchStatusMessage ? (
              <p
                className="text-gray-5 text-center font-medium"
                style={{ fontSize: STATUS_MESSAGE_FONT_SIZE * scale }}
              >
                {searchStatusMessage}
              </p>
            ) : undefined
          }
        />

        {region && !trimmedSearchQuery ? (
          <SelectedNeighborhoodCard
            neighborhood={region}
            onClear={handleClearSelection}
          />
        ) : null}

        {!trimmedSearchQuery && !region ? (
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
            onSelect={(popularRegion) =>
              handleSelectNeighborhood(fromRegion(popularRegion))
            }
          />
        )}
      </main>

      <button
        type="button"
        disabled={!region}
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
