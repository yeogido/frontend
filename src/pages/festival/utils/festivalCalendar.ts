/**
 * 행사 일정(달력) 보기에서 쓰는 날짜 계산. 날짜는 URL 쿼리와 API에 그대로
 * 넘길 수 있도록 'YYYY-MM-DD' 문자열로 다룬다. 같은 형식끼리는 문자열
 * 비교가 곧 날짜 비교라 Date 객체 없이 앞뒤를 판단할 수 있다.
 */

const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_VALUE_PATTERN = /^(\d{4})-(\d{2})$/;

export interface FestivalDateRange {
  startDate: string;
  /** 시작일만 고른 상태면 null이다. 이때는 시작일 하루로 조회한다. */
  endDate: string | null;
}

export interface FestivalCalendarMonth {
  year: number;
  /** 0부터 시작하는 월(Date#getMonth와 같다). */
  monthIndex: number;
}

export interface FestivalCalendarDay {
  date: string;
  day: number;
  /** 0 = 일요일, 6 = 토요일 */
  weekday: number;
  isCurrentMonth: boolean;
}

export const formatFestivalDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const isFestivalDateValue = (
  value: string | null | undefined
): value is string => {
  if (!value) return false;

  const matched = DATE_VALUE_PATTERN.exec(value);
  if (!matched) return false;

  const year = Number(matched[1]);
  const monthIndex = Number(matched[2]) - 1;
  const day = Number(matched[3]);
  const date = new Date(year, monthIndex, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
  );
};

/** URL의 start/end 값을 기간으로 되돌린다. 잘못된 값이면 선택 안 함으로 본다. */
export const parseFestivalDateRange = (
  startParam: string | null,
  endParam: string | null
): FestivalDateRange | null => {
  if (!isFestivalDateValue(startParam)) {
    return null;
  }

  if (!isFestivalDateValue(endParam)) {
    return { startDate: startParam, endDate: null };
  }

  return endParam < startParam
    ? { startDate: endParam, endDate: startParam }
    : { startDate: startParam, endDate: endParam };
};

/**
 * 날짜를 눌렀을 때의 다음 기간.
 * - 아무것도 없거나 기간이 완성된 상태 → 누른 날짜가 새 시작일
 * - 시작일만 있는 상태 → 누른 날짜가 종료일(시작일보다 앞이면 서로 바꾼다)
 */
export const getNextFestivalDateRange = (
  range: FestivalDateRange | null,
  tappedDate: string
): FestivalDateRange => {
  if (!range || range.endDate !== null) {
    return { startDate: tappedDate, endDate: null };
  }

  return tappedDate < range.startDate
    ? { startDate: tappedDate, endDate: range.startDate }
    : { startDate: range.startDate, endDate: tappedDate };
};

/** API 조회 기간. 시작일만 고른 상태면 그 하루로 조회한다. */
export const toFestivalDateQuery = (range: FestivalDateRange | null) =>
  range
    ? { startDate: range.startDate, endDate: range.endDate ?? range.startDate }
    : {};

export const isDateInFestivalRange = (
  date: string,
  range: FestivalDateRange | null
) => {
  if (!range) return false;

  const endDate = range.endDate ?? range.startDate;

  return date >= range.startDate && date <= endDate;
};

export const formatFestivalMonthValue = ({
  year,
  monthIndex,
}: FestivalCalendarMonth) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

/**
 * 달력에 보여줄 달. URL의 month 값이 가장 우선이고, 없으면 선택한 시작일이
 * 있는 달, 그것도 없으면 오늘이 있는 달이다.
 */
export const resolveFestivalCalendarMonth = (
  monthParam: string | null,
  range: FestivalDateRange | null,
  today: Date = new Date()
): FestivalCalendarMonth => {
  const matched = monthParam ? MONTH_VALUE_PATTERN.exec(monthParam) : null;
  const monthIndex = matched ? Number(matched[2]) - 1 : -1;

  if (matched && monthIndex >= 0 && monthIndex <= 11) {
    return { year: Number(matched[1]), monthIndex };
  }

  if (range) {
    return {
      year: Number(range.startDate.slice(0, 4)),
      monthIndex: Number(range.startDate.slice(5, 7)) - 1,
    };
  }

  return { year: today.getFullYear(), monthIndex: today.getMonth() };
};

export const shiftFestivalCalendarMonth = (
  { year, monthIndex }: FestivalCalendarMonth,
  offset: number
): FestivalCalendarMonth => {
  const date = new Date(year, monthIndex + offset, 1);

  return { year: date.getFullYear(), monthIndex: date.getMonth() };
};

/**
 * 해당 달을 덮는 주(일~토) 목록. 앞뒤 달 날짜는 그 주를 채우는 만큼만
 * 넣어서, 달에 따라 5주 또는 6주가 된다.
 */
export const createFestivalCalendarWeeks = ({
  year,
  monthIndex,
}: FestivalCalendarMonth): FestivalCalendarDay[][] => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const leadingDays = firstDay.getDay();
  const weekCount = Math.ceil((leadingDays + lastDate) / 7);

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(
        year,
        monthIndex,
        1 - leadingDays + weekIndex * 7 + weekday
      );

      return {
        date: formatFestivalDateValue(date),
        day: date.getDate(),
        weekday,
        isCurrentMonth: date.getMonth() === monthIndex,
      };
    })
  );
};
