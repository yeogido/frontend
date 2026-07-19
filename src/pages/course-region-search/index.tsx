import { useSearchParams } from 'react-router-dom';

import { LoadingSpinner, SearchBar } from '../../components/common';

import {
  CitySelectionSection,
  DistrictSelectionSection,
  RecentSearchSection,
} from './components';
import useCourseRegionSearch from './hooks/useCourseRegionSearch';

function CourseRegionSearchPage() {
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') ?? '';
  const {
    cities,
    isRegionError,
    isRegionLoading,
    recentSearches,
    searchSuggestions,
    selectedCity,
    selectedDistrict,
    selectedParentDistrict,
    visibleDistricts,
    searchLabel,
    searchPlaceholder,
    clearRecentSearches,
    removeRecentSearch,
    selectCity,
    selectDistrict,
    selectRecentSearch,
    submitSearch,
  } = useCourseRegionSearch();

  return (
    <section
      className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center bg-background pt-3 pb-8"
      aria-label="검색 및 지역 선택"
    >
      <SearchBar
        initialQuery={initialKeyword}
        className="z-20"
        placeholder={searchPlaceholder}
        label={searchLabel}
        suggestions={searchSuggestions}
        onSearch={submitSearch}
      />

      <RecentSearchSection
        searches={recentSearches}
        onClear={clearRecentSearches}
        onRemove={removeRecentSearch}
        onSelect={selectRecentSearch}
      />

      {isRegionLoading ? (
        <LoadingSpinner className="mt-24" label="지역 정보를 불러오는 중" />
      ) : null}

      {!isRegionLoading && isRegionError ? (
        <p className="text-main-5 mt-24 text-center text-[13px] leading-normal font-medium">
          지역 정보를 불러오지 못했습니다.
        </p>
      ) : null}

      {!isRegionLoading && !isRegionError && selectedCity ? (
        <>
          <CitySelectionSection
            cities={cities}
            selectedCityId={selectedCity.id}
            onSelect={selectCity}
          />

          <DistrictSelectionSection
            districts={visibleDistricts}
            selectedDistrict={selectedDistrict}
            parentDistrictName={selectedParentDistrict?.name}
            onSelect={selectDistrict}
          />
        </>
      ) : null}
    </section>
  );
}

export default CourseRegionSearchPage;
