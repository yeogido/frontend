import { LoadingSpinner } from '../../../../components/common';
import { DesktopPageShell } from '../../../../components/layout/desktop';
import DesktopSearchField from '../../desktop/DesktopSearchField';
import { useRegionSelection } from '../useRegionSelection';
import PopularRegionDesktopGrid from './PopularRegionDesktopGrid';
import RecentRegionDesktopSection from './RecentRegionDesktopSection';
import RegionSelectedDesktopBar from './RegionSelectedDesktopBar';

/**
 * 지역 선택 — 데스크톱 뷰(Figma 6336:86661 / 6336:87616).
 *
 * 검색·선택·최근 검색·인기 지역 흐름은 useRegionSelection을 모바일과 같이
 * 쓴다. 시안에는 다음 단계로 가는 버튼이 없지만 모바일 흐름에 필요해서,
 * 선택 전에는 비활성인 버튼을 다른 데스크톱 화면과 같은 모양으로 붙였다.
 */
function RegionSelectionDesktopPage() {
  const {
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
    clearSelectedNeighborhood,
    selectRecentByLabel,
    removeRecentByIndex,
    selectPopularRegion,
    goNext,
  } = useRegionSelection();

  return (
    <DesktopPageShell>
      <div className="flex flex-col gap-[40px]">
        <header className="flex flex-col gap-[6px]">
          <h1 className="text-[32px] font-semibold text-black">
            어디를 추천하시겠어요?
          </h1>
          <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
            코스를 등록할 지역을 검색하거나 선택해 주세요
          </p>
        </header>

        {selectedRegion ? (
          <RegionSelectedDesktopBar
            name={selectedRegion.selectionName}
            onClear={clearSelectedNeighborhood}
          />
        ) : (
          <DesktopSearchField
            placeholder="지역명 또는 도시명을 검색해 주세요"
            label="지역명 또는 도시명 검색"
            suggestions={searchSuggestions.map((item) => item.label)}
            filterSuggestions={false}
            onQueryChange={handleQueryChange}
            onSuggestionSelect={handleSuggestionSelect}
            onEnter={handleEnter}
          />
        )}

        {searchError ? (
          <p role="alert">
            지역 검색에 실패했습니다. 검색어를 다시 입력하거나 Enter를 눌러
            재시도해 주세요.
          </p>
        ) : null}

        <RecentRegionDesktopSection
          searches={recentLabels}
          onClear={clearRecentRegions}
          onRemove={removeRecentByIndex}
          onSelect={selectRecentByLabel}
        />

        {regionsQuery.isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner label="인기 지역을 불러오는 중" />
          </div>
        ) : regionsQuery.isError ? (
          <p aria-live="polite" className="text-gray-5 text-center text-[16px]">
            인기 지역을 불러오지 못했습니다.
          </p>
        ) : (
          <PopularRegionDesktopGrid
            regions={popularRegions}
            selectedRegionId={selectedRegion?.id}
            onSelect={(region) => {
              const candidate = popularRegions.find(
                (item) => item.id === region.id
              );

              selectPopularRegion(candidate?.regionId);
            }}
          />
        )}

        <button
          type="button"
          disabled={!selectedNeighborhood}
          onClick={goNext}
          className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 w-full rounded-[12px] py-[16px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
        >
          기본 정보 입력하기
        </button>
      </div>
    </DesktopPageShell>
  );
}

export default RegionSelectionDesktopPage;
