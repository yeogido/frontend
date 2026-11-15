import { MdArrowDropDown, MdChevronLeft, MdChevronRight } from 'react-icons/md';

import {
  createFestivalCalendarWeeks,
  type FestivalCalendarDay,
  type FestivalCalendarMonth,
} from '../utils/festivalCalendar';

// Figma 1440 데스크톱 시안(6370:66628) 기준 리터럴 px.
const GRID_WIDTH = 468;
const DAY_SIZE = 36;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface FestivalDesktopCalendarProps {
  readonly month: FestivalCalendarMonth;
  readonly selectedDate: string;
  readonly onMonthShift: (offset: number) => void;
  readonly onDateSelect: (date: string) => void;
}

function getWeekdayColor(weekday: number, isCurrentMonth: boolean) {
  if (!isCurrentMonth) return 'text-gray-3';
  if (weekday === 0) return 'text-main-5';
  if (weekday === 6) return 'text-[#5a97cc]';

  return 'text-black';
}

function getDayLabel(day: FestivalCalendarDay, selectedDate: string) {
  return `${day.date.replaceAll('-', '.')}${
    day.date === selectedDate ? ' 선택됨' : ''
  }`;
}

/** 데스크톱 행사 달력 — 한 날짜만 고르고, 고른 날의 행사는 옆 패널에 뜬다. */
function FestivalDesktopCalendar({
  month,
  selectedDate,
  onMonthShift,
  onDateSelect,
}: FestivalDesktopCalendarProps) {
  const weeks = createFestivalCalendarWeeks(month);

  return (
    <section
      aria-label="행사 달력"
      className="border-gray-2 flex flex-col gap-[32px] rounded-[24px] border bg-white px-[33px] py-[25px]"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => onMonthShift(-1)}
        >
          <MdChevronLeft aria-hidden="true" className="text-[24px]" />
        </button>
        <p className="flex items-center text-[18px] font-semibold text-black">
          {month.year}년 {month.monthIndex + 1}월
          <MdArrowDropDown aria-hidden="true" className="text-[24px]" />
        </p>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => onMonthShift(1)}
        >
          <MdChevronRight aria-hidden="true" className="text-[24px]" />
        </button>
      </div>

      <div style={{ width: GRID_WIDTH }} className="mx-auto">
        <div className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((label, weekday) => (
            <span
              key={label}
              className={`text-center text-[16px] font-medium ${
                weekday === 0
                  ? 'text-main-5'
                  : weekday === 6
                    ? 'text-[#5a97cc]'
                    : 'text-black'
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-[20px] flex flex-col gap-[15px]">
          {weeks.map((week) => (
            <div
              key={week[0].date}
              className="grid grid-cols-7 justify-items-center"
            >
              {week.map((day) => {
                const isSelected = day.date === selectedDate;

                return (
                  <button
                    key={day.date}
                    type="button"
                    aria-label={getDayLabel(day, selectedDate)}
                    aria-pressed={isSelected}
                    onClick={() => onDateSelect(day.date)}
                    style={{ width: DAY_SIZE, height: DAY_SIZE }}
                    className={`rounded-full text-[16px] ${
                      isSelected
                        ? 'bg-main-5 font-medium text-white'
                        : getWeekdayColor(day.weekday, day.isCurrentMonth)
                    }`}
                  >
                    {day.day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FestivalDesktopCalendar;
