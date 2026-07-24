import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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

  const searchSuggestions = useMemo(() => {
    const districtSuggestions = createRegionSearchSuggestions(cities);

    return getUniqueSearches([
      ...recentSearches,
      ...cities.map((city) => city.name),
      ...districtSuggestions,
    ]);
  }, [cities, recentSearches]);

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

  const submitSearch = (query: string) => {
    const keyword = query.trim();

    if (!keyword) {
      return;
    }

    addRecentSearch(keyword);
    navigate(
      createSearchResultLocation({
        targetPathname: searchTargetPathname,
        keyword,
      })
    );
  };

  const selectRecentSearch = (keyword: string) => {
    addRecentSearch(keyword);
    navigate(
      createSearchResultLocation({
        targetPathname: searchTargetPathname,
        keyword,
      })
    );
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
      const selectedSubDistrict =
        district === '전체'
          ? selectedParentDistrict.name
          : `${selectedParentDistrict.name} ${district}`;

      setSelectedDistrict(district);
      navigate(
        createSearchResultLocation({
          targetPathname: searchTargetPathname,
          city: selectedCity.name,
          district: selectedSubDistrict,
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
  };
}

export default useCourseRegionSearch;
