import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { searchRegions } from '../../../apis/regions.api';
import {
  COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
  courseRegionRecentSearchKeywords,
} from '../../../constants/recentSearches';
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
import { createRegionSearchSuggestions } from '../utils/regionSuggestions';

import useRegionOptions from './useRegionOptions';

const DISTRICT_STEP_STATE_KEY = 'courseRegionDistrictStep';
const recentSearchStorageOptions = {
  storageKey: COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
  fallbackSearches: courseRegionRecentSearchKeywords,
};

const getDistrictStepName = (state: unknown) => {
  if (
    typeof state === 'object' &&
    state !== null &&
    DISTRICT_STEP_STATE_KEY in state
  ) {
    const districtStep = (state as Record<string, unknown>)[
      DISTRICT_STEP_STATE_KEY
    ];

    if (typeof districtStep === 'string') {
      return districtStep;
    }
  }

  return undefined;
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
  const districtStepName = getDistrictStepName(location.state);
  const selectedParentDistrict = selectedCity?.districts.find(
    (district) =>
      district.name === districtStepName && Boolean(district.subDistricts)
  );

  const visibleDistricts = selectedCity
    ? (selectedParentDistrict?.subDistricts ??
      selectedCity.districts.map((district) => district.name))
    : [];

  const defaultSearchSuggestions = useMemo(() => {
    const districtSuggestions = createRegionSearchSuggestions(cities);

    return getUniqueSearches([
      ...recentSearches,
      ...cities.map((city) => city.name),
      ...districtSuggestions,
    ]);
  }, [cities, recentSearches]);

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
      navigate(`/region-info/${matchedCity.id}`);

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

  const updateDistrictStepState = (districtStep?: string, replace = false) => {
    const nextState = districtStep
      ? { [DISTRICT_STEP_STATE_KEY]: districtStep }
      : null;

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      {
        replace,
        state: nextState,
      }
    );
  };

  const selectCity = (city: CityOption) => {
    updateDistrictStepState(undefined, true);
    setSelectedCityId(city.id);
    setSelectedDistrict('전체');
  };

  const selectDistrict = (district: string) => {
    if (!selectedCity) {
      return;
    }

    if (selectedParentDistrict) {
      setSelectedDistrict(district);

      if (district === '전체') {
        navigate(`/region-info/${selectedCity.id}`);

        return;
      }

      navigate(
        createSearchResultLocation({
          targetPathname: searchTargetPathname,
          city: selectedCity.name,
          district: `${selectedParentDistrict.name} ${district}`,
        })
      );

      return;
    }

    const nextDistrict = selectedCity.districts.find(
      (cityDistrict) => cityDistrict.name === district
    );

    if (nextDistrict?.subDistricts && district !== '전체') {
      updateDistrictStepState(nextDistrict.name);
      setSelectedDistrict('전체');

      return;
    }

    setSelectedDistrict(district);

    if (district === '전체') {
      navigate(`/region-info/${selectedCity.id}`);

      return;
    }

    navigate(
      createSearchResultLocation({
        targetPathname: searchTargetPathname,
        city: selectedCity.name,
        district,
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
