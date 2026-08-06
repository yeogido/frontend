import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { getSubRegions, searchRegions } from '../../../apis/regions.api';
import {
  COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
  courseRegionRecentSearchKeywords,
} from '../../../constants/recentSearches';
import type { SubRegion } from '../../../types/region.type';
import {
  addStoredRecentSearch,
  getStoredRecentSearches,
  getUniqueSearches,
  saveRecentSearches,
} from '../../../utils/recentSearches';

import {
  COURSE_REGION_SEARCH_TARGET_PARAM,
  courseRegionSearchTargets,
  getCourseRegionSearchTarget,
} from '../constants/searchTargets';
import type { CityOption } from '../types';

import useRegionOptions from './useRegionOptions';

interface RegionPathStep {
  id: number;
  name: string;
}

const REGION_PATH_STATE_KEY = 'courseRegionPath';
const recentSearchStorageOptions = {
  storageKey: COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
  fallbackSearches: courseRegionRecentSearchKeywords,
};

const getRegionPathFromState = (state: unknown): RegionPathStep[] => {
  if (
    typeof state === 'object' &&
    state !== null &&
    REGION_PATH_STATE_KEY in state
  ) {
    const path = (state as Record<string, unknown>)[REGION_PATH_STATE_KEY];

    if (Array.isArray(path)) {
      return path as RegionPathStep[];
    }
  }

  return [];
};

function createSearchResultLocation(params: {
  targetPathname: string;
  keyword?: string;
  city?: string;
  district?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.keyword) {
    searchParams.set('keyword', params.keyword);
  }

  if (params.city) {
    searchParams.set('region', params.city);
  }

  if (params.district && params.district !== '전체') {
    searchParams.set('subRegion', params.district);
  }

  const search = searchParams.toString();

  return {
    pathname: params.targetPathname,
    search: search ? `?${search}` : '',
  };
}

function useCourseRegionSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const {
    cities,
    defaultCityId,
    isLoading: isRegionLoading,
    isError: isRegionError,
  } = useRegionOptions();
  const searchTarget = getCourseRegionSearchTarget(
    searchParams.get(COURSE_REGION_SEARCH_TARGET_PARAM)
  );
  const searchTargetConfig = courseRegionSearchTargets[searchTarget];
  const searchTargetPathname = searchTargetConfig.pathname;
  const [selectedCityId, setSelectedCityId] = useState(defaultCityId);
  const [selectedDistrict, setSelectedDistrict] = useState('전체');
  const [recentSearches, setRecentSearches] = useState<string[]>(
    () => getStoredRecentSearches(recentSearchStorageOptions)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedSearchQuery = searchQuery.trim();

  const selectedCity = cities.find((city) => city.id === selectedCityId);
  const regionPath = getRegionPathFromState(location.state);
  const selectedParentDistrict = regionPath.at(-1);

  // 지금 보고 있는 단계(도시 바로 아래, 혹은 그 아래로 한 번 더 들어간 지역)의
  // 상위 regionId. 이게 바뀔 때마다 그 하위 지역 목록을 새로 조회한다.
  const currentParentRegionId = selectedParentDistrict
    ? selectedParentDistrict.id
    : selectedCity?.regionId;

  const subRegionsQuery = useQuery({
    queryKey: ['regions', currentParentRegionId, 'sub-regions'],
    queryFn: () => getSubRegions(currentParentRegionId as number),
    enabled: currentParentRegionId !== undefined,
    staleTime: 5 * 60_000,
  });

  // 로딩 중에는 '전체'만 보여줘서 목록이 비었다가 채워지는 깜빡임을 줄인다.
  const visibleDistricts = currentParentRegionId
    ? ['전체', ...(subRegionsQuery.data ?? []).map((region) => region.name)]
    : [];

  const defaultSearchSuggestions = useMemo(
    () => getUniqueSearches([...recentSearches, ...cities.map((city) => city.name)]),
    [cities, recentSearches]
  );

  // 검색창에 입력하는 즉시(타이핑마다) 백엔드에 물어 연관 검색어를 채운다.
  // 백엔드가 이름 LIKE(부분 문자열) 매칭이라 SearchBar의 로컬 재필터를
  // 그대로 통과하므로, 이 목록을 suggestions로 넘기기만 하면 된다.
  const searchResultsQuery = useQuery({
    queryKey: ['regions', 'search', trimmedSearchQuery],
    queryFn: () => searchRegions(trimmedSearchQuery),
    enabled: trimmedSearchQuery.length > 0,
    staleTime: 30_000,
  });

  // searchResultsQuery.data는 새 키워드로 바뀔 때마다 응답 전까지 잠깐
  // undefined가 되는데, 그 사이 suggestions가 비어버리면 SearchBar가
  // 드롭다운을 닫아버린다. 응답이 아직 없을 때는(로딩 중) 기본 목록을,
  // 응답이 왔지만 결과가 없을 때는([]) 그대로 빈 목록을 보여준다.
  const liveSearchSuggestions = searchResultsQuery.data?.map(
    (region) => region.name
  );

  const searchSuggestions =
    trimmedSearchQuery.length > 0
      ? getUniqueSearches(liveSearchSuggestions ?? defaultSearchSuggestions)
      : defaultSearchSuggestions;

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  const addRecentSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return;
    }

    const nextSearches = addStoredRecentSearch(
      trimmedKeyword,
      {
        ...recentSearchStorageOptions,
        currentSearches: recentSearches,
      }
    );

    setRecentSearches(nextSearches);
  };

  const findMatchingCity = (keyword: string) =>
    cities.find(
      (city) => keyword === city.name || keyword.startsWith(`${city.name} `)
    );

  const navigateToSearchResult = (keyword: string) => {
    const matchedCity = findMatchingCity(keyword);

    if (matchedCity) {
      navigate(`/region-info/${encodeURIComponent(matchedCity.name)}`);

      return;
    }

    navigate(
      createSearchResultLocation({
        targetPathname: searchTargetPathname,
        keyword,
      })
    );
  };

  const submitSearch = (query: string) => {
    const keyword = query.trim();

    if (!keyword) {
      return;
    }

    addRecentSearch(keyword);
    navigateToSearchResult(keyword);
  };

  const selectRecentSearch = (keyword: string) => {
    addRecentSearch(keyword);
    navigateToSearchResult(keyword);
  };

  const removeRecentSearch = (targetIndex: number) => {
    const nextSearches = recentSearches.filter(
      (_, index) => index !== targetIndex
    );

    saveRecentSearches(nextSearches, recentSearchStorageOptions);
    setRecentSearches(nextSearches);
  };

  const clearRecentSearches = () => {
    saveRecentSearches([], recentSearchStorageOptions);
    setRecentSearches([]);
  };

  const updateRegionPathState = (path: RegionPathStep[], replace = false) => {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      {
        replace,
        state: path.length > 0 ? { [REGION_PATH_STATE_KEY]: path } : null,
      }
    );
  };

  const selectCity = (city: CityOption) => {
    updateRegionPathState([], true);
    setSelectedCityId(city.id);
    setSelectedDistrict('전체');
  };

  const selectDistrict = async (district: string) => {
    if (!selectedCity) {
      return;
    }

    setSelectedDistrict(district);

    if (district === '전체') {
      navigate(`/region-info/${encodeURIComponent(selectedCity.name)}`);

      return;
    }

    const clicked = (subRegionsQuery.data ?? []).find(
      (region) => region.name === district
    );

    if (!clicked) {
      return;
    }

    // 이 지역이 더 하위 지역을 갖고 있는지 확인해서, 있으면 한 단계 더
    // 들어가고 없으면(리프) 검색 결과로 바로 넘어간다. 조회에 실패하면
    // 사용자가 더 못 넘어가고 멈추기보다는 리프인 것처럼 진행시킨다.
    let children: SubRegion[];

    try {
      children = await queryClient.fetchQuery({
        queryKey: ['regions', clicked.subRegionId, 'sub-regions'],
        queryFn: () => getSubRegions(clicked.subRegionId),
        staleTime: 5 * 60_000,
      });
    } catch {
      children = [];
    }

    if (children.length > 0) {
      updateRegionPathState([
        ...regionPath,
        { id: clicked.subRegionId, name: clicked.name },
      ]);
      setSelectedDistrict('전체');

      return;
    }

    const districtLabel = [...regionPath.map((step) => step.name), clicked.name].join(
      ' '
    );

    navigate(
      createSearchResultLocation({
        targetPathname: searchTargetPathname,
        city: selectedCity.name,
        district: districtLabel,
      })
    );
  };

  return {
    cities,
    isRegionError,
    isRegionLoading,
    recentSearches,
    searchSuggestions,
    selectedCity,
    selectedDistrict,
    selectedParentDistrict,
    visibleDistricts,
    searchLabel: searchTargetConfig.searchLabel,
    searchPlaceholder: searchTargetConfig.searchPlaceholder,
    clearRecentSearches,
    removeRecentSearch,
    selectCity,
    selectDistrict,
    selectRecentSearch,
    submitSearch,
    updateSearchQuery,
  };
}

export default useCourseRegionSearch;
