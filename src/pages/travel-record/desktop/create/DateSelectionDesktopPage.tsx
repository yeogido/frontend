import { useState } from 'react';
import { MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md';

import { TravelFolderArtwork } from '../../components';
import monthDropdownIcon from '../../date-selection/assets/month-dropdown-icon.svg';
import type { TravelDatePreset } from '../../date-selection/types';
import {
  createCalendarMonth,
  formatSelectedDateRange,
  isDateInRange,
  isFutureDate,
  isFutureMonth,
  isSameDate,
} from '../../date-selection/utils/calendar';
import { useDateSelectionPage } from '../../date-selection/useDateSelectionPage';
import { formatPeriodLabel } from '../../utils/formatPeriodLabel';
import CreateStepLayout from './CreateStepLayout';
import FolderPreviewCard from './FolderPreviewCard';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = Array.from({ length: 12 }, (_, index) => index);
const PRESETS: { id: TravelDatePreset; label: string; hasIcon: boolean }[] = [
  { id: 'today', label: '오늘', hasIcon: true },
  { id: 'yesterday', label: '어제', hasIcon: true },
  { id: 'this-week', label: '이번주', hasIcon: false },
  { id: 'custom', label: '직접 선택', hasIcon: true },
];

const getDayColor = (date: Date, isCurrentMonth: boolean) => {
  if (isFutureDate(date)) return 'text-[#cfcfcf]';
  if (!isCurrentMonth) return 'text-gray-3';
  if (date.getDay() === 0) return 'text-main-5';
  if (date.getDay() === 6) return 'text-[#7dc3ff]';
  return 'text-black';
};

/** Figma 6330:62347 — 언제 다녀오셨나요? */
function DateSelectionDesktopPage() {
  const {
    canGoToNextMonth,
    selectedPreset,
    selectedRange,
    selectedRegion,
    visibleYear,
    visibleMonthIndex,
    visibleMonthLabel,
    goToNextMonth,
    goToPreviousMonth,
    handleAddPhoto,
    selectDate,
    selectMonth,
    selectPreset,
  } = useDateSelectionPage();
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const calendarDates = createCalendarMonth(visibleYear, visibleMonthIndex);
  const regionName =
    selectedRegion?.selectionName ?? selectedRegion?.name ?? '';
  const isRange = !isSameDate(selectedRange.startDate, selectedRange.endDate);

  return (
    <CreateStepLayout
      title="언제 다녀오셨나요?"
      description="여행한 날짜를 선택해 주세요"
      actionLabel="사진 추가하기"
      onAction={handleAddPhoto}
      preview={
        <FolderPreviewCard
          art={<TravelFolderArtwork photos={[]} title="" decorations={[]} />}
          regionName={regionName}
          caption={
            <span className="text-gray-5 rounded-full bg-[#e4e4e4] px-[12px] py-[6px] text-[14px]">
              {formatPeriodLabel(
                selectedRange.startDate,
                selectedRange.endDate
              )}
            </span>
          }
        />
      }
    >
      <div
        role="group"
        aria-label="날짜 빠른 선택"
        className="flex h-[52px] items-center justify-around rounded-[12px] bg-[#f1f1f1] px-[12px]"
      >
        {PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectPreset(preset.id)}
              className={`flex h-[32px] items-center gap-[4px] rounded-[12px] px-[10px] text-[14px] font-medium ${
                isSelected ? 'text-main-5 bg-white' : 'text-gray-5'
              }`}
            >
              {preset.hasIcon ? (
                <MdCalendarToday aria-hidden="true" className="text-[18px]" />
              ) : null}
              {preset.label}
            </button>
          );
        })}
      </div>

      <section
        aria-label="달력"
        className="border-gray-2 mt-[32px] rounded-[24px] border px-[26px] py-[24px]"
      >
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 달"
            onClick={goToPreviousMonth}
            className="text-gray-5 flex size-[32px] items-center justify-center"
          >
            <MdChevronLeft aria-hidden="true" className="text-[28px]" />
          </button>
          <button
            type="button"
            aria-expanded={isMonthPickerOpen}
            onClick={() => setIsMonthPickerOpen((isOpen) => !isOpen)}
            className="flex items-center text-[16px] font-semibold text-black"
          >
            {visibleMonthLabel}
            <img src={monthDropdownIcon} alt="" className="size-[24px]" />
          </button>
          <button
            type="button"
            aria-label="다음 달"
            disabled={!canGoToNextMonth}
            onClick={goToNextMonth}
            className="text-gray-5 flex size-[32px] items-center justify-center disabled:opacity-30"
          >
            <MdChevronRight aria-hidden="true" className="text-[28px]" />
          </button>
        </div>

        {isMonthPickerOpen ? (
          <ul
            aria-label="월 선택"
            className="mt-[16px] grid grid-cols-4 gap-[8px]"
          >
            {MONTHS.map((monthIndex) => (
              <li key={monthIndex}>
                <button
                  type="button"
                  disabled={isFutureMonth(visibleYear, monthIndex)}
                  onClick={() => {
                    selectMonth(visibleYear, monthIndex);
                    setIsMonthPickerOpen(false);
                  }}
                  className={`h-[40px] w-full rounded-[12px] text-[14px] font-medium disabled:opacity-30 ${
                    monthIndex === visibleMonthIndex
                      ? 'bg-main-5 text-white'
                      : 'bg-[#f1f1f1] text-black'
                  }`}
                >
                  {monthIndex + 1}월
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="mt-[28px] grid grid-cols-7 px-[44px] text-center text-[14px] font-medium">
              {WEEKDAYS.map((weekday, index) => (
                <span
                  key={weekday}
                  className={index === 0 ? 'text-main-5' : 'text-black'}
                >
                  {weekday}
                </span>
              ))}
            </div>
            <div className="mt-[16px] grid grid-cols-7 px-[44px]">
              {calendarDates.map(({ date, day, isCurrentMonth }) => {
                const isStart = isSameDate(date, selectedRange.startDate);
                const isEnd = isSameDate(date, selectedRange.endDate);
                const isEdge = isStart || isEnd;
                const isInRange = isRange && isDateInRange(date, selectedRange);

                return (
                  <div
                    key={date.getTime()}
                    className={`flex h-[52px] items-center justify-center ${
                      isInRange ? 'bg-main-2' : ''
                    } ${isInRange && isStart ? 'rounded-l-full' : ''} ${
                      isInRange && isEnd ? 'rounded-r-full' : ''
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isFutureDate(date)}
                      aria-pressed={isEdge}
                      onClick={() => selectDate(date)}
                      className={`flex size-[40px] items-center justify-center rounded-full text-[14px] font-medium disabled:cursor-not-allowed ${
                        isEdge
                          ? 'bg-main-5 text-white'
                          : getDayColor(date, isCurrentMonth)
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <div className="text-gray-5 mt-[20px] flex h-[52px] items-center gap-[12px] rounded-[12px] bg-[#f1f1f1] px-[16px] text-[14px]">
        <span className="bg-main-3 flex size-[32px] items-center justify-center rounded-full">
          <MdCalendarToday
            aria-hidden="true"
            className="text-main-5 text-[16px]"
          />
        </span>
        {formatSelectedDateRange(selectedRange) || '선택한 날짜'}
      </div>
    </CreateStepLayout>
  );
}

export default DateSelectionDesktopPage;
