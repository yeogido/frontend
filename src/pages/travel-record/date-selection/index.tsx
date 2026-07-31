import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { TravelRecordPageFrame } from '../components';

import backIcon from './assets/back-icon.svg';
import {
  TravelDateCalendarSection,
  TravelDatePresetSelectorSection,
  TravelDatePromptSection,
} from './components';
import { useTravelDateSelection } from './hooks';
import type { TravelDateSelectionLocationState } from './types';
import {
  getTravelRecordDraftRegion,
  getTravelRecordDraftDateRange,
  saveTravelRecordDraftDateRange,
} from '../utils/draftStorage';
import { getTravelRecordEditRoute } from '../utils/editRoute';

function TravelRecordDateSelectionPage() {
  const navigate = useNavigate();
  const { travelRecordId } = useParams<{ travelRecordId: string }>();
  const location = useLocation();
  const locationState =
    location.state as TravelDateSelectionLocationState | null;
  const storedSelectedRegion = useMemo(() => getTravelRecordDraftRegion(), []);
  const selectedRegion = locationState?.selectedRegion ?? storedSelectedRegion;
  const {
    canGoToNextMonth,
    canGoToPreviousMonth,
    canAddPhoto,
    selectedPreset,
    selectedRange,
    visibleYear,
    visibleMonthIndex,
    visibleMonthLabel,
    goToNextMonth,
    goToPreviousMonth,
    selectDate,
    selectMonth,
    selectPreset,
  } = useTravelDateSelection(getTravelRecordDraftDateRange());

  useEffect(() => {
    if (!selectedRegion) {
      navigate(
        travelRecordId
          ? getTravelRecordEditRoute(travelRecordId)
          : '/travel-record/new',
        { replace: true },
      );
    }
  }, [navigate, selectedRegion]);

  const handleAddPhoto = () => {
    if (!selectedRange || !selectedRegion) {
      return;
    }

    saveTravelRecordDraftDateRange(selectedRange);

    navigate(
      travelRecordId
        ? getTravelRecordEditRoute(travelRecordId, 'photos')
        : '/travel-record/photo-selection',
      {
      state: {
        selectedRegion,
        selectedDateRange: selectedRange,
      },
      },
    );
  };

  return (
    <TravelRecordPageFrame className="bg-[#f9f9f9]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="이전 화면으로 돌아가기"
        className="absolute top-[60px] left-6 flex size-6 items-center justify-center"
      >
        <img src={backIcon} alt="" aria-hidden="true" className="size-6" />
      </button>

      <TravelDatePromptSection />

      <TravelDatePresetSelectorSection
        selectedPreset={selectedPreset}
        onSelectPreset={selectPreset}
      />

      <TravelDateCalendarSection
        canGoToNextMonth={canGoToNextMonth}
        canGoToPreviousMonth={canGoToPreviousMonth}
        selectedRange={selectedRange}
        visibleYear={visibleYear}
        visibleMonthIndex={visibleMonthIndex}
        visibleMonthLabel={visibleMonthLabel}
        onNextMonth={goToNextMonth}
        onPreviousMonth={goToPreviousMonth}
        onSelectDate={selectDate}
        onSelectMonth={selectMonth}
      />

      <button
        type="button"
        disabled={!canAddPhoto}
        onClick={handleAddPhoto}
        className="absolute top-[759px] left-6 flex h-[53px] w-[342px] items-center justify-center rounded-xl bg-[#e4e4e4] text-[18px] leading-none font-semibold text-[#7f7f7f] enabled:bg-[#ff6f41] enabled:text-[#f9f9f9]"
      >
        사진 추가하기
      </button>
    </TravelRecordPageFrame>
  );
}

export default TravelRecordDateSelectionPage;
