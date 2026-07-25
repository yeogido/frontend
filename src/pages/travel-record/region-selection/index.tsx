import { IoChevronBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import { TravelRecordPageFrame } from '../components';

import {
  PopularRegionGrid,
  RecentSearchSection,
  RegionSearchInput,
  RegionSuggestionList,
  SelectedRegionSearchBar,
} from './components';
import { useTravelRecordRegionSelection } from './hooks';
import { saveTravelRecordDraftRegion } from '../utils/draftStorage';

function TravelRecordRegionSelectionPage() {
  const navigate = useNavigate();
  const {
    filteredRegions,
    isSuggestionOpen,
    query,
    recentSearches,
    selectedRegion,
    visibleSuggestions,
    clearRecentSearches,
    clearSelectedRegion,
    openSuggestions,
    removeRecentSearch,
    selectRegion,
    selectRegionName,
    submitSearch,
    updateQuery,
  } = useTravelRecordRegionSelection();

  return (
    <TravelRecordPageFrame className="bg-[#f9f9f9] px-6 pt-[60px]">
      <button
        type="button"
        onClick={() => navigate('/travel-record')}
        aria-label="보관 화면으로 돌아가기"
        className="text-gray-5 flex size-6 shrink-0 items-center justify-start"
      >
        <IoChevronBack aria-hidden="true" className="text-[24px]" />
      </button>

      <section className="mt-4 flex shrink-0 flex-col gap-3">
        <h1 className="text-[32px] leading-none font-semibold text-black">
          어디를
          <br />
          다녀오셨나요?
        </h1>
        <p className="text-gray-5 text-[14px] leading-none">
          다녀온 지역을 검색하거나 선택해 주세요
        </p>
      </section>

      <form
        role="search"
        onSubmit={submitSearch}
        className="relative z-20 mt-[47px] w-full shrink-0"
      >
        {selectedRegion ? (
          <SelectedRegionSearchBar
            region={selectedRegion}
            onClear={clearSelectedRegion}
          />
        ) : (
          <RegionSearchInput
            query={query}
            onQueryChange={updateQuery}
            onFocus={openSuggestions}
          />
        )}

        {!selectedRegion && isSuggestionOpen ? (
          <RegionSuggestionList
            query={query}
            suggestions={visibleSuggestions}
            onSelect={selectRegionName}
          />
        ) : null}
      </form>

      <RecentSearchSection
        searches={recentSearches}
        onClear={clearRecentSearches}
        onRemove={removeRecentSearch}
        onSelect={selectRegionName}
      />

      <PopularRegionGrid
        regions={filteredRegions}
        selectedRegionId={selectedRegion?.id}
        onSelect={selectRegion}
      />
      <button
        type="button"
        disabled={!selectedRegion}
        onClick={() => {
          if (!selectedRegion) {
            return;
          }

          const draftRegion = {
            id: selectedRegion.id,
            name: selectedRegion.name,
            province: selectedRegion.province,
            selectionName: selectedRegion.selectionName,
          };

          saveTravelRecordDraftRegion(draftRegion);

          navigate('/travel-record/date-selection', {
            state: {
              selectedRegion: draftRegion,
            },
          });
        }}
        className="bg-gray-2 text-gray-4 enabled:bg-main-5 absolute top-[759px] right-6 left-6 flex h-[53px] items-center justify-center rounded-xl text-[18px] leading-none font-semibold enabled:text-white"
      >
        날짜 선택하기
      </button>
    </TravelRecordPageFrame>
  );
}

export default TravelRecordRegionSelectionPage;
