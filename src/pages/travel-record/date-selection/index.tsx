import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import backIcon from './assets/back-icon.svg';
import {
  TravelDateCalendarSection,
  TravelDatePresetSelectorSection,
  TravelDatePromptSection,
} from './components';
import { useTravelDateSelection } from './hooks';
import type { TravelDateSelectionLocationState } from './types';
import { getTravelRecordDraftRegion } from '../utils/draftStorage';

function TravelRecordDateSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as TravelDateSelectionLocationState | null;
  const storedSelectedRegion = useMemo(() => getTravelRecordDraftRegion(), []);
  const selectedRegion = locationState?.selectedRegion ?? storedSelectedRegion;
  const photoInputRef = useRef<HTMLInputElement>(null);
  const {
    canAddPhoto,
    canGoToNextMonth,
    canGoToPreviousMonth,
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
  } = useTravelDateSelection();

  useEffect(() => {
    if (!selectedRegion) {
      navigate('/travel-record/new', { replace: true });
    }
  }, [navigate, selectedRegion]);

  const handleAddPhoto = () => {
    if (!canAddPhoto) {
      return;
    }

    photoInputRef.current?.click();
  };

  return (
    <main className="relative mx-auto h-[844px] w-full max-w-[390px] bg-[#f9f9f9]">
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

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        aria-label="사진 선택"
        className="sr-only"
      />

      <button
        type="button"
        onClick={handleAddPhoto}
        disabled={!canAddPhoto}
        className="absolute top-[759px] left-6 flex h-[53px] w-[342px] items-center justify-center rounded-xl bg-[#e4e4e4] text-[18px] leading-none font-semibold text-[#7f7f7f] enabled:bg-[#ff6f41] enabled:text-[#f9f9f9]"
      >
        사진 추가하기
      </button>
    </main>
  );
}

export default TravelRecordDateSelectionPage;
