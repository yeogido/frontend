import { TravelRecordPageFrame } from '../components';

import backIcon from '../../../assets/icons/back.svg';
import {
  TravelDateCalendarSection,
  TravelDatePresetSelectorSection,
  TravelDatePromptSection,
} from './components';
import { useDateSelectionPage } from './useDateSelectionPage';

function TravelRecordDateSelectionPage() {
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
    handleAddPhoto,
    navigate,
    selectDate,
    selectMonth,
    selectPreset,
  } = useDateSelectionPage();

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
