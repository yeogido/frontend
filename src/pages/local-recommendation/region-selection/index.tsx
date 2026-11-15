import type { FormEvent } from 'react';

import { LoadingSpinner } from '../../../components/common';
import { RegionSelectionLayout } from '../../../components/region-selection';
import {
  PopularRegionGrid,
  RecentSearchSection,
  RegionSearchInput,
  RegionSuggestionList,
  SelectedRegionSearchBar,
} from '../../travel-record/region-selection/components';

import { useRegionSelection } from './useRegionSelection';

function LocalRecommendationPage() {
  const {
    searchQuery,
    isSuggestionOpen,
    selectedNeighborhood,
    selectedRegion,
    regionsQuery,
    popularRegions,
    searchSuggestions,
    searchError,
    recentLabels,
    clearRecentRegions,
    handleQueryChange,
    handleSuggestionSelect,
    handleEnter,
    openSuggestionsIfQuery,
    clearSelectedNeighborhood,
    selectRecentByLabel,
    removeRecentByIndex,
    selectPopularRegion,
    goNext,
    goBack,
  } = useRegionSelection();

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleEnter();
  };

  return (
    <RegionSelectionLayout
      onBack={goBack}
      backAriaLabel="이전 화면으로 돌아가기"
      title={
        <>
          어디를
          <br />
          추천하시겠어요?
        </>
      }
      description="코스를 등록할 지역을 검색하거나 선택해 주세요."
      search={
        <form role="search" onSubmit={handleSearchSubmit} className="relative">
          {selectedRegion ? (
            <SelectedRegionSearchBar
              region={selectedRegion}
              onClear={clearSelectedNeighborhood}
            />
          ) : (
            <RegionSearchInput
              query={searchQuery}
              onQueryChange={handleQueryChange}
              onFocus={openSuggestionsIfQuery}
              onEnter={handleEnter}
            />
          )}
          {searchError ? (
            <p role="alert">
              지역 검색에 실패했습니다. 검색어를 다시 입력하거나 Enter를 눌러
              재시도해 주세요.
            </p>
          ) : null}
          {!selectedRegion && isSuggestionOpen ? (
            <RegionSuggestionList
              query={searchQuery}
              suggestions={searchSuggestions.map((item) => item.label)}
              onSelect={handleSuggestionSelect}
            />
          ) : null}
        </form>
      }
      recentSearches={
        <RecentSearchSection
          searches={recentLabels}
          onClear={clearRecentRegions}
          onRemove={removeRecentByIndex}
          onSelect={selectRecentByLabel}
        />
      }
      popularRegions={
        regionsQuery.isLoading ? (
          <div className="mt-8 flex justify-center">
            <LoadingSpinner label="인기 지역을 불러오는 중" />
          </div>
        ) : regionsQuery.isError ? (
          <section
            aria-live="polite"
            className="mt-8 text-center text-[14px] text-[#505050]"
          >
            인기 지역을 불러오지 못했습니다.
          </section>
        ) : (
          <PopularRegionGrid
            regions={popularRegions}
            selectedRegionId={selectedRegion?.id}
            onSelect={(region) => selectPopularRegion(region.regionId)}
          />
        )
      }
      action={
        <button
          type="button"
          disabled={!selectedNeighborhood}
          onClick={goNext}
          className="bg-gray-2 text-gray-4 enabled:bg-main-5 flex h-[53px] w-full items-center justify-center rounded-xl text-[18px] leading-none font-semibold enabled:text-white"
        >
          기본 정보 입력하기
        </button>
      }
    />
  );
}

export default LocalRecommendationPage;
