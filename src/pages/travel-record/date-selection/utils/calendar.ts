import type { CalendarDate, TravelDateRange } from '../types';

export const INITIAL_MONTH_INDEX = new Date().getMonth();
export const INITIAL_YEAR = new Date().getFullYear();

const createDate = (year: number, monthIndex: number, day: number) =>
  new Date(year, monthIndex, day);

export const getStartOfDay = (date: Date) =>
  createDate(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) =>
  createDate(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isDateInRange = (date: Date, range: TravelDateRange | null) => {
  if (!range) {
    return false;
  }

  const targetTime = getStartOfDay(date).getTime();

  return (
    targetTime >= getStartOfDay(range.startDate).getTime() &&
    targetTime <= getStartOfDay(range.endDate).getTime()
  );
};

export const isFutureDate = (date: Date) =>
  getStartOfDay(date).getTime() > getStartOfDay(new Date()).getTime();

export const isFutureMonth = (year: number, monthIndex: number) => {
  const today = getStartOfDay(new Date());

  return (
    year > today.getFullYear() ||
    (year === today.getFullYear() && monthIndex > today.getMonth())
  );
};

export const formatDateLabel = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return `${year}. ${month}. ${day} (${weekdays[date.getDay()]})`;
};

export const formatSelectedDateRange = (range: TravelDateRange | null) => {
  if (!range) {
    return '';
  }

  if (isSameDate(range.startDate, range.endDate)) {
    return formatDateLabel(range.startDate);
  }

  return `${formatDateLabel(range.startDate)} - ${formatDateLabel(range.endDate)}`;
};

export const createCalendarMonth = (
  year: number,
  monthIndex: number,
): CalendarDate[] => {
  const firstDay = createDate(year, monthIndex, 1);
  const startOffset = firstDay.getDay();
  const startDate = addDays(firstDay, -startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(startDate, index);

    return {
      date,
      day: date.getDate(),
      monthIndex: date.getMonth(),
      isCurrentMonth: date.getMonth() === monthIndex,
    };
  });
};
