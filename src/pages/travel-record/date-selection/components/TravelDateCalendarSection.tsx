import { useEffect, useRef, useState } from 'react';

import backIcon from '../assets/back-icon.svg';
import calendarIconActive from '../assets/calendar-icon-active.svg';
import monthDropdownIcon from '../assets/month-dropdown-icon.svg';
import nextMonthIcon from '../assets/next-month-icon.svg';
import type { TravelDateRange } from '../types';
import {
  createCalendarMonth,
  formatSelectedDateRange,
  isDateInRange,
  isFutureMonth,
  isSameDate,
} from '../utils/calendar';
import TravelDateCalendarDay from './TravelDateCalendarDay';

interface TravelDateCalendarSectionProps {
  canGoToNextMonth: boolean;
  canGoToPreviousMonth: boolean;
  selectedRange: TravelDateRange | null;
  visibleYear: number;
  visibleMonthIndex: number;
  visibleMonthLabel: string;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (date: Date) => void;
  onSelectMonth: (year: number, monthIndex: number) => void;
}

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const months = Array.from({ length: 12 }, (_, index) => index);

const rangeSegmentLeftClasses = [
  'left-[-7px]',
  'left-[39.5px]',
  'left-[86px]',
  'left-[132.5px]',
  'left-[179px]',
  'left-[225.5px]',
  'left-[272px]',
];

const rangeSegmentTopClasses = [
  'top-[-7px]',
  'top-[45px]',
  'top-[97px]',
  'top-[149px]',
  'top-[201px]',
  'top-[253px]',
];

const rangeSegmentWidthClasses = [
  'w-9',
  'w-[82.5px]',
  'w-[129px]',
  'w-[175.5px]',
  'w-[222px]',
  'w-[268.5px]',
  'w-[315px]',
];

interface RangeSegment {
  key: string;
  rowIndex: number;
  startColumnIndex: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
}

const createRangeSegments = (
  calendarDates: ReturnType<typeof createCalendarMonth>,
  selectedRange: TravelDateRange | null,
): RangeSegment[] => {
  if (!selectedRange) {
    return [];
  }

  return Array.from({ length: 6 }, (_, rowIndex) => {
    const rowDates = calendarDates.slice(rowIndex * 7, rowIndex * 7 + 7);
    const selectedIndexes = rowDates
      .map((calendarDate, columnIndex) =>
        isDateInRange(calendarDate.date, selectedRange) ? columnIndex : -1,
      )
      .filter((columnIndex) => columnIndex >= 0);

    if (selectedIndexes.length === 0) {
      return null;
    }

    const startColumnIndex = selectedIndexes[0];
    const endColumnIndex = selectedIndexes[selectedIndexes.length - 1];
    const startDate = rowDates[startColumnIndex].date;
    const endDate = rowDates[endColumnIndex].date;

    return {
      key: `${rowIndex}-${startColumnIndex}-${endColumnIndex}`,
      rowIndex,
      startColumnIndex,
      span: endColumnIndex - startColumnIndex + 1,
      isStart: isSameDate(startDate, selectedRange.startDate),
      isEnd: isSameDate(endDate, selectedRange.endDate),
    };
  }).filter((segment): segment is RangeSegment => segment !== null);
};

function TravelDateCalendarSection({
  canGoToNextMonth,
  canGoToPreviousMonth,
  selectedRange,
  visibleYear,
  visibleMonthIndex,
  visibleMonthLabel,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
  onSelectMonth,
}: TravelDateCalendarSectionProps) {
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(visibleYear);
  const currentYear = new Date().getFullYear();
  const calendarDates = createCalendarMonth(
    visibleYear,
    visibleMonthIndex,
  );
  const selectedDateLabel = formatSelectedDateRange(selectedRange);
  const rangeSegments = createRangeSegments(calendarDates, selectedRange);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!monthDropdownRef.current?.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleSelectMonth = (monthIndex: number) => {
    if (isFutureMonth(draftYear, monthIndex)) {
      return;
    }

    onSelectMonth(draftYear, monthIndex);
    setIsMonthDropdownOpen(false);
  };

  const handlePreviousMonth = () => {
    setIsMonthDropdownOpen(false);
    onPreviousMonth();
  };

  const handleNextMonth = () => {
    setIsMonthDropdownOpen(false);
    onNextMonth();
  };

  const toggleMonthDropdown = () => {
    setDraftYear(visibleYear);
    setIsMonthDropdownOpen((isOpen) => !isOpen);
  };

  return (
    <section className="absolute top-[309px] left-6 w-[342px]">
      <div className="h-[348px] overflow-hidden rounded-xl border border-[#e4e4e4] bg-[#f9f9f9]">
        <div className="mx-auto mt-[13px] flex w-[302px] flex-col gap-5">
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={handlePreviousMonth}
              disabled={!canGoToPreviousMonth}
              aria-label="이전 달"
              className="flex size-4 items-center justify-center disabled:opacity-30"
            >
              <img
                src={backIcon}
                alt=""
                aria-hidden="true"
                className="size-4"
              />
            </button>

            <div ref={monthDropdownRef} className="relative">
              <button
                type="button"
                onClick={toggleMonthDropdown}
                className="flex items-center text-[14px] leading-none font-semibold text-[#1c1c1c]"
                aria-haspopup="listbox"
                aria-expanded={isMonthDropdownOpen}
                aria-label={`${visibleMonthLabel} 선택`}
              >
                <span>{visibleMonthLabel}</span>
                <img
                  src={monthDropdownIcon}
                  alt=""
                  aria-hidden="true"
                  className={`size-6 transition-transform ${
                    isMonthDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isMonthDropdownOpen ? (
                <div className="absolute top-[31px] left-1/2 z-30 w-[210px] -translate-x-1/2 rounded-xl border border-[#e4e4e4] bg-[#f9f9f9] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setDraftYear((year) => year - 1)}
                      aria-label="이전 연도"
                      className="flex size-6 items-center justify-center"
                    >
                      <img
                        src={backIcon}
                        alt=""
                        aria-hidden="true"
                        className="size-4"
                      />
                    </button>
                    <span className="text-[14px] leading-none font-semibold text-[#1c1c1c]">
                      {draftYear}년
                    </span>
                    <button
                      type="button"
                      onClick={() => setDraftYear((year) => year + 1)}
                      disabled={draftYear >= currentYear}
                      aria-label="다음 연도"
                      className="flex size-6 items-center justify-center disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <img
                        src={nextMonthIcon}
                        alt=""
                        aria-hidden="true"
                        className="size-4"
                      />
                    </button>
                  </div>

                  <div
                    role="listbox"
                    aria-label="월 선택"
                    className="grid grid-cols-3 gap-2"
                  >
                    {months.map((monthIndex) => {
                      const isSelected =
                        draftYear === visibleYear &&
                        monthIndex === visibleMonthIndex;
                      const isDisabled = isFutureMonth(
                        draftYear,
                        monthIndex,
                      );

                      return (
                        <button
                          key={monthIndex}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={isDisabled}
                          onClick={() => handleSelectMonth(monthIndex)}
                          className={`h-8 rounded-lg text-[12px] leading-none font-medium disabled:cursor-not-allowed ${
                            isDisabled
                              ? 'text-[#cfcfcf]'
                              : isSelected
                              ? 'bg-[#ffebe5] text-[#ff6f41]'
                              : 'text-[#505050]'
                          }`}
                        >
                          {monthIndex + 1}월
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoToNextMonth}
              aria-label="다음 달"
              className="flex size-4 items-center justify-center disabled:opacity-30"
            >
              <img
                src={nextMonthIcon}
                alt=""
                aria-hidden="true"
                className="size-4"
              />
            </button>
          </div>

          <div className="flex flex-col gap-5 text-center text-[12px] leading-none font-medium">
            <div className="grid grid-cols-7 justify-items-center">
              {weekdays.map((weekday, index) => (
                <span
                  key={weekday}
                  className={`w-[22px] ${
                    index === 0 ? 'text-[#ff6f41]' : 'text-[#1c1c1c]'
                  }`}
                >
                  {weekday}
                </span>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 z-0">
                {rangeSegments.map((segment) => (
                  <span
                    key={segment.key}
                    aria-hidden="true"
                    className={`absolute h-9 bg-[#fbd0c2] ${
                      rangeSegmentTopClasses[segment.rowIndex]
                    } ${rangeSegmentLeftClasses[segment.startColumnIndex]} ${
                      rangeSegmentWidthClasses[segment.span - 1]
                    } ${
                      segment.isStart && segment.isEnd
                        ? 'rounded-full'
                        : `${segment.isStart ? 'rounded-l-full' : ''} ${
                            segment.isEnd ? 'rounded-r-full' : ''
                          }`
                    }`}
                  />
                ))}
              </div>

              <div className="relative z-10 grid grid-cols-7 justify-items-center gap-x-6 gap-y-[30px]">
                {calendarDates.map((calendarDate) => (
                  <TravelDateCalendarDay
                    key={calendarDate.date.toISOString()}
                    calendarDate={calendarDate}
                    onSelectDate={onSelectDate}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedDateLabel ? (
        <div className="mt-4 flex h-[43px] items-center gap-4 rounded-xl bg-[#f1f1f1] px-2.5">
          <span className="flex size-[24px] items-center justify-center rounded-full bg-[#ffebe5]">
            <img
              src={calendarIconActive}
              alt=""
              aria-hidden="true"
              className="size-[18px]"
            />
          </span>
          <span className="flex min-w-0 items-center gap-2 text-[12px] leading-none whitespace-nowrap">
            <span className="shrink-0 font-medium text-[#7f7f7f]">
              선택한 날짜
            </span>
            <span className="truncate text-[#1c1c1c]">
              {selectedDateLabel}
            </span>
          </span>
        </div>
      ) : null}
    </section>
  );
}

export default TravelDateCalendarSection;
