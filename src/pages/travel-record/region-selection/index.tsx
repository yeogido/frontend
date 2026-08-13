import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TravelRecordPageFrame } from '../components';
import { useTravelRecordSessionStore } from '../../../store/travelRecordSession.store';

import {
  EmptyFolderPreview,
  RecentSearchSection,
  RegionSearchInput,
  RegionSuggestionList,
  SelectedRegionSearchBar,
} from './components';
import { useTravelRecordRegionSelection } from './hooks';
import {
  clearTravelRecordDraftDateRange,
  saveTravelRecordDraftRegion,
} from '../utils/draftStorage';
import { getTravelRecordDraftRegion } from '../utils/draftStorage';
import { getTravelRecordEditRoute } from '../utils/editRoute';
import { getInitialTravelRecordRegion } from './initialSelectedRegion';
import backIcon from '../../../assets/icons/back.svg';

function TravelRecordRegionSelectionPage() {
  const navigate = useNavigate();
  const { travelRecordId } = useParams<{ travelRecordId: string }>();
  const storedDraftRegion = getTravelRecordDraftRegion();
  const clearEdit = useTravelRecordSessionStore((state) => state.clearEdit);
  const isEditing = Boolean(travelRecordId);
  const {
    isSuggestionOpen,
    query,
    recentSearches,
    selectedRegion,
    visibleSuggestions,
    clearRecentSearches,
    clearSelectedRegion,
    openSuggestions,
    removeRecentSearch,
    selectRegionName,
    submitSearch,
    updateQuery,
  } = useTravelRecordRegionSelection(
    getInitialTravelRecordRegion(isEditing, storedDraftRegion),
  );

  useEffect(() => {
    if (!travelRecordId) {
      clearEdit();
    }
  }, [clearEdit, travelRecordId]);

  return (
    <TravelRecordPageFrame className="bg-[#f9f9f9] px-6 pt-[60px]">
      <button
        type="button"
        onClick={() => navigate('/travel-record')}
        aria-label="보관 화면으로 돌아가기"
        className="text-gray-5 flex size-6 shrink-0 items-center justify-start"
      >
        <img src={backIcon} alt="" aria-hidden="true" className="size-6" />
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

      {/* 지역을 고르기 전에는 검색창에 입력한 글자를 그대로 따라 보여 준다. */}
      <EmptyFolderPreview
        regionName={selectedRegion?.selectionName ?? query}
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
            regionId: selectedRegion.regionId,
            name: selectedRegion.name,
            province: selectedRegion.province,
            selectionName: selectedRegion.selectionName,
          };

          if (!isEditing) {
            clearTravelRecordDraftDateRange();
          }
          saveTravelRecordDraftRegion(draftRegion);

          navigate(
            travelRecordId
              ? getTravelRecordEditRoute(travelRecordId, 'date')
              : '/travel-record/date-selection',
            {
            state: {
              selectedRegion: draftRegion,
            },
            },
          );
        }}
        className="bg-gray-2 text-gray-4 enabled:bg-main-5 absolute top-[759px] right-6 left-6 flex h-[53px] items-center justify-center rounded-xl text-[18px] leading-none font-semibold enabled:text-white"
      >
        날짜 선택하기
      </button>
    </TravelRecordPageFrame>
  );
}

export default TravelRecordRegionSelectionPage;
