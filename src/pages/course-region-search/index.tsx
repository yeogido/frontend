import { useSearchParams } from 'react-router-dom';

import { LoadingSpinner, SearchBar } from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';

import {
  CitySelectionSection,
  DistrictSelectionSection,
  RecentSearchSection,
} from './components';
import useCourseRegionSearch from './hooks/useCourseRegionSearch';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 32;
const LOADING_MARGIN_TOP = 96;
const MESSAGE_TEXT_SIZE = 13;

function CourseRegionSearchPage() {
  const scale = useGlobalScale();
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
      className="mx-auto flex min-h-screen w-full flex-col bg-background"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
      aria-label="검색 및 지역 선택"
    >
        <SearchBar
            initialQuery={initialKeyword}
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
        <div style={{ marginTop: LOADING_MARGIN_TOP * scale }}>
          <LoadingSpinner label="지역 정보를 불러오는 중" />
        </div>
      ) : null}

      {!isRegionLoading && isRegionError ? (
        <p
          className="text-main-5 text-center font-medium leading-normal"
          style={{
            marginTop: LOADING_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
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
