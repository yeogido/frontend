import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getSubRegions, searchRegions } from '../../../apis/regions.api';
import { COURSE_REGION_RECENT_SEARCH_STORAGE_KEY } from '../../../constants/recentSearches';
import { REGION_INFO_ID_STATE_KEY } from '../../../constants/regions';
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
  getNationwideSearchPagePath,
  getNationwideSearchPath,
} from '../constants/searchTargets';
import type { CityOption } from '../types';
import { isNationwideCity } from '../utils/citySelection';
import {
  getRecentSearchLocation,
  getSubRegionRecentSearch,
  isKnownRegionPath,
} from '../utils/recentSearch';

import useRegionOptions from './useRegionOptions';

const recentSearchStorageOptions = {
  storageKey: COURSE_REGION_RECENT_SEARCH_STORAGE_KEY,
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

  // 선택된 광역 지역의 regionId로 시·군·구 목록을 조회한다.
  const currentParentRegionId = selectedCity?.regionId;

  const subRegionsQuery = useQuery({
    queryKey: ['regions', currentParentRegionId, 'sub-regions'],
    queryFn: () => getSubRegions(currentParentRegionId as number),
    enabled: currentParentRegionId !== undefined,
    staleTime: 5 * 60_000,
  });

  // 로딩 중에는 '전체'만 보여줘서 목록이 비었다가 채워지는 깜빡임을 줄인다.
  const visibleDistricts =
    currentParentRegionId !== undefined
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
    (region) => region.fullName
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

  // 시/도의 하위 지역 이름을 확인한다. 조회에 실패하면 검증할 수 없으므로
  // 지역으로 단정하지 않고 빈 목록을 돌려 키워드 검색으로 떨어뜨린다.
  const fetchSubRegionNames = async (regionId: number | undefined) => {
    if (regionId === undefined) {
      return [];
    }

    try {
      const subRegions = await queryClient.fetchQuery({
        queryKey: ['regions', regionId, 'sub-regions'],
        queryFn: () => getSubRegions(regionId),
        staleTime: 5 * 60_000,
      });

      return subRegions.map((subRegion) => subRegion.name);
    } catch {
      return [];
    }
  };

  const navigateToSearchResult = async (keyword: string) => {
    const recentSearchLocation = getRecentSearchLocation(keyword, cities);
    const matchedCity = recentSearchLocation?.city;
    const district = recentSearchLocation?.district;
    const isRegionPath =
      matchedCity !== undefined &&
      isKnownRegionPath(
        district,
        district === undefined
          ? []
          : await fetchSubRegionNames(matchedCity.regionId)
      );

    if (matchedCity && isRegionPath) {
      if (searchTargetConfig.navigatesToRegionInfo) {
        navigate(`/region-info/${encodeURIComponent(matchedCity.name)}`, {
          state: { [REGION_INFO_ID_STATE_KEY]: matchedCity.regionId },
        });

        return;
      }

      navigate(
        createSearchResultLocation({
          targetPathname: searchTargetPathname,
          city: matchedCity.name,
          district,
        })
      );

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
    void navigateToSearchResult(keyword);
  };

  const selectRecentSearch = (keyword: string) => {
    addRecentSearch(keyword);
    void navigateToSearchResult(keyword);
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

  const selectCity = (city: CityOption) => {
    if (isNationwideCity(city.id)) {
      navigate(getNationwideSearchPath(searchTarget));

      return;
    }

    setSelectedCityId(city.id);
    setSelectedDistrict('전체');
  };

  const selectNationwideSearch = () => {
    navigate(getNationwideSearchPagePath(searchTarget));
  };

  const selectDistrict = (district: string) => {
    if (!selectedCity) {
      return;
    }

    setSelectedDistrict(district);

    if (district === '전체') {
      addRecentSearch(selectedCity.name);

      if (searchTargetConfig.navigatesToRegionInfo) {
        navigate(`/region-info/${encodeURIComponent(selectedCity.name)}`, {
          state: { [REGION_INFO_ID_STATE_KEY]: selectedCity.regionId },
        });

        return;
      }

      navigate(
        createSearchResultLocation({
          targetPathname: searchTargetPathname,
          city: selectedCity.name,
        })
      );

      return;
    }

    const clicked = (subRegionsQuery.data ?? []).find(
      (region) => region.name === district
    );

    if (!clicked) {
      return;
    }

    addRecentSearch(getSubRegionRecentSearch(selectedCity.name, clicked.name));

    navigate(
      createSearchResultLocation({
        targetPathname: searchTargetPathname,
        city: selectedCity.name,
        district: clicked.name,
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
    selectedCityId,
    selectedDistrict,
    visibleDistricts,
    searchLabel: searchTargetConfig.searchLabel,
    searchPlaceholder: searchTargetConfig.searchPlaceholder,
    clearRecentSearches,
    removeRecentSearch,
    selectCity,
    selectNationwideSearch,
    selectDistrict,
    selectRecentSearch,
    submitSearch,
    updateSearchQuery,
  };
}

export default useCourseRegionSearch;
