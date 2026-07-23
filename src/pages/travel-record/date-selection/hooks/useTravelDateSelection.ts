import { useMemo, useState } from 'react';

import type { TravelDatePreset, TravelDateRange } from '../types';
import {
  addDays,
  getStartOfDay,
  INITIAL_MONTH_INDEX,
  INITIAL_YEAR,
  isFutureDate,
  isFutureMonth,
  isSameDate,
} from '../utils/calendar';

const createToday = () => getStartOfDay(new Date());
const getStartOfWeek = (date: Date) => {
  const dayOfWeek = date.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return addDays(date, -daysFromMonday);
};

const getAdjacentMonth = (
  year: number,
  monthIndex: number,
  offset: number,
) => new Date(year, monthIndex + offset, 1);

const getPresetRange = (
  preset: Exclude<TravelDatePreset, 'custom'>,
  baseDate: Date,
): TravelDateRange => {
  const startDate = getStartOfDay(baseDate);

  switch (preset) {
    case 'today':
      return { startDate, endDate: startDate };
    case 'yesterday': {
      const yesterday = addDays(startDate, -1);

      return { startDate: yesterday, endDate: yesterday };
    }
    case 'this-week': {
      const startOfWeek = getStartOfWeek(startDate);

      return { startDate: startOfWeek, endDate: startDate };
    }
  }
};

function useTravelDateSelection() {
  const [visibleYear, setVisibleYear] = useState(INITIAL_YEAR);
  const [visibleMonthIndex, setVisibleMonthIndex] =
    useState(INITIAL_MONTH_INDEX);
  const [selectedPreset, setSelectedPreset] =
    useState<TravelDatePreset>('custom');
  const [selectedRange, setSelectedRange] = useState<TravelDateRange | null>(
    null,
  );

  const previousMonth = getAdjacentMonth(visibleYear, visibleMonthIndex, -1);
  const nextMonth = getAdjacentMonth(visibleYear, visibleMonthIndex, 1);
  const canGoToPreviousMonth = true;
  const canGoToNextMonth =
    !isFutureMonth(nextMonth.getFullYear(), nextMonth.getMonth());
  const canAddPhoto = selectedRange !== null;

  const visibleMonthLabel = useMemo(
    () => `${visibleYear}년 ${visibleMonthIndex + 1}월`,
    [visibleMonthIndex, visibleYear],
  );

  const selectPreset = (preset: TravelDatePreset) => {
    setSelectedPreset(preset);

    if (preset === 'custom') {
      return;
    }

    const range = getPresetRange(preset, createToday());

    setVisibleYear(range.startDate.getFullYear());
    setVisibleMonthIndex(range.startDate.getMonth());
    setSelectedRange(range);
  };

  const selectDate = (date: Date) => {
    if (isFutureDate(date)) {
      return;
    }

    const selectedDate = getStartOfDay(date);

    if (
      selectedPreset !== 'custom' ||
      !selectedRange ||
      !isSameDate(selectedRange.startDate, selectedRange.endDate)
    ) {
      setSelectedPreset('custom');
      setSelectedRange({
        startDate: selectedDate,
        endDate: selectedDate,
      });
      setVisibleYear(date.getFullYear());
      setVisibleMonthIndex(date.getMonth());

      return;
    }

    const startDate = selectedRange.startDate;
    const [nextStartDate, nextEndDate] =
      selectedDate.getTime() < startDate.getTime()
        ? [selectedDate, startDate]
        : [startDate, selectedDate];

    setSelectedRange({
      startDate: nextStartDate,
      endDate: nextEndDate,
    });
    setVisibleYear(date.getFullYear());
    setVisibleMonthIndex(date.getMonth());
  };

  const goToPreviousMonth = () => {
    setVisibleYear(previousMonth.getFullYear());
    setVisibleMonthIndex(previousMonth.getMonth());
  };

  const goToNextMonth = () => {
    if (!canGoToNextMonth) {
      return;
    }

    setVisibleYear(nextMonth.getFullYear());
    setVisibleMonthIndex(nextMonth.getMonth());
  };

  const selectMonth = (year: number, monthIndex: number) => {
    setVisibleYear(year);
    setVisibleMonthIndex(monthIndex);
  };

  return {
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
  };
}

export default useTravelDateSelection;
