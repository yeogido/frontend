import { useEffect, useRef, useState } from 'react';

import { useScaleFrame } from '../../../hooks/useScaleFrame';
import backIcon from '../assets/back-icon.svg';
import monthDropdownIcon from '../assets/month-dropdown-icon.svg';
import nextMonthIcon from '../assets/next-month-icon.svg';
import {
  createFestivalCalendarWeeks,
  isDateInFestivalRange,
  shiftFestivalCalendarMonth,
  type FestivalCalendarDay,
  type FestivalCalendarMonth,
  type FestivalDateRange,
} from '../utils/festivalCalendar';

// 모든 수치는 Figma 390 디자인 기준(달력 자체 폭 342) 리터럴 px
const CALENDAR_DESIGN_WIDTH = 342;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = Array.from({ length: 12 }, (_, index) => index);

interface FestivalCalendarProps {
  month: FestivalCalendarMonth;
  selectedRange: FestivalDateRange | null;
  onMonthChange: (month: FestivalCalendarMonth) => void;
  onDateSelect: (date: string) => void;
}

function getDayTextColor({ weekday, isCurrentMonth }: FestivalCalendarDay) {
  if (!isCurrentMonth) return 'text-[#a1a1a1]';
  if (weekday === 0) return 'text-[#ff6f41]';
  if (weekday === 6) return 'text-[#7dc3ff]';

  return 'text-[#1c1c1c]';
}

/**
 * 선택 기간 띠. 여행 기록 날짜 선택과 같이 연한 주황 띠를 깔고, 실제
 * 시작일·종료일 쪽만 둥글게 한다. 주가 바뀌는 칸은 칸 끝까지 평평하게 이어
 * 다음 줄로 넘어간 기간임을 보여준다.
 */
function getRangeBandClassName(
  calendarDay: FestivalCalendarDay,
  selectedRange: FestivalDateRange | null
) {
  if (
    !selectedRange ||
    !isDateInFestivalRange(calendarDay.date, selectedRange)
  ) {
    return null;
  }

  const endDate = selectedRange.endDate ?? selectedRange.startDate;
  const isStart = calendarDay.date === selectedRange.startDate;
  const isEnd = calendarDay.date === endDate;

  if (isStart && isEnd) return 'left-1/2 w-9 -translate-x-1/2 rounded-full';
  if (isStart) return 'left-[calc(50%-18px)] right-0 rounded-l-full';
  if (isEnd) return 'left-0 right-[calc(50%-18px)] rounded-r-full';

  return 'inset-x-0';
}

function FestivalCalendar({
  month,
  selectedRange,
  onMonthChange,
  onDateSelect,
}: FestivalCalendarProps) {
  const { outerRef, innerRef, scale, scaledHeight } = useScaleFrame(
    CALENDAR_DESIGN_WIDTH
  );
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(month.year);
  const weeks = createFestivalCalendarWeeks(month);
  const monthLabel = `${month.year}년 ${month.monthIndex + 1}월`;

  useEffect(() => {
    if (!isMonthPickerOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!monthPickerRef.current?.contains(event.target as Node)) {
        setIsMonthPickerOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMonthPickerOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMonthPickerOpen]);

  const moveMonth = (offset: number) => {
    setIsMonthPickerOpen(false);
    onMonthChange(shiftFestivalCalendarMonth(month, offset));
  };

  const toggleMonthPicker = () => {
    setDraftYear(month.year);
    setIsMonthPickerOpen((isOpen) => !isOpen);
  };

  const selectMonth = (monthIndex: number) => {
    onMonthChange({ year: draftYear, monthIndex });
    setIsMonthPickerOpen(false);
  };

  return (
    <div
      ref={outerRef}
      className="relative z-[5] w-full"
      style={{ height: scaledHeight }}
    >
      <section
        ref={innerRef}
        aria-label="행사 일정 달력"
        className="rounded-xl border border-[#e4e4e4] bg-[#f9f9f9] px-[19px] pt-3 pb-[7px]"
        style={{
          width: CALENDAR_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="flex h-[25px] items-center justify-between">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            aria-label="이전 달"
            className="flex size-4 items-center justify-center"
          >
            <img src={backIcon} alt="" aria-hidden="true" className="size-4" />
          </button>

          <div ref={monthPickerRef} className="relative">
            <button
              type="button"
              onClick={toggleMonthPicker}
              aria-haspopup="listbox"
              aria-expanded={isMonthPickerOpen}
              aria-label={`${monthLabel}, 연도와 월 선택`}
              className="flex items-center text-[14px] leading-none font-semibold text-[#1c1c1c]"
            >
              <span>{monthLabel}</span>
              <img
                src={monthDropdownIcon}
                alt=""
                aria-hidden="true"
                className={`size-6 transition-transform ${
                  isMonthPickerOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMonthPickerOpen ? (
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
                    aria-label="다음 연도"
                    className="flex size-6 items-center justify-center"
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
                  {MONTHS.map((monthIndex) => {
                    const isSelected =
                      draftYear === month.year &&
                      monthIndex === month.monthIndex;

                    return (
                      <button
                        key={monthIndex}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => selectMonth(monthIndex)}
                        className={`h-8 rounded-lg text-[12px] leading-none font-medium ${
                          isSelected
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
            onClick={() => moveMonth(1)}
            aria-label="다음 달"
            className="flex size-4 items-center justify-center"
          >
            <img
              src={nextMonthIcon}
              alt=""
              aria-hidden="true"
              className="size-4"
            />
          </button>
        </div>

        <div className="mx-[-11.5px] mt-[21px] grid grid-cols-7 text-center text-[12px] leading-none font-medium">
          {WEEKDAYS.map((weekday, index) => (
            <span
              key={weekday}
              className={index === 0 ? 'text-[#ff6f41]' : 'text-[#1c1c1c]'}
            >
              {weekday}
            </span>
          ))}
        </div>

        <div
          role="grid"
          aria-label={monthLabel}
          className="mx-[-11.5px] mt-[6px]"
        >
          {weeks.map((week) => (
            <div
              key={week[0].date}
              role="row"
              className="grid h-11 grid-cols-7"
            >
              {week.map((calendarDay) => {
                const bandClassName = getRangeBandClassName(
                  calendarDay,
                  selectedRange
                );
                const isSelected = bandClassName !== null;

                return (
                  <div
                    key={calendarDay.date}
                    role="gridcell"
                    aria-selected={isSelected}
                    className="relative flex items-center justify-center"
                  >
                    {bandClassName ? (
                      <span
                        aria-hidden="true"
                        className={`absolute top-1/2 h-9 -translate-y-1/2 bg-[#fbd0c2] ${bandClassName}`}
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onDateSelect(calendarDay.date)}
                      aria-label={`${Number(calendarDay.date.slice(5, 7))}월 ${calendarDay.day}일`}
                      aria-pressed={isSelected}
                      className={`relative z-10 flex size-9 items-center justify-center rounded-full text-[12px] leading-none font-medium ${getDayTextColor(calendarDay)}`}
                    >
                      {calendarDay.day}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FestivalCalendar;
