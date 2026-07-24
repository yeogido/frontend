import type { CalendarDate } from '../types';
import { isFutureDate } from '../utils/calendar';

interface TravelDateCalendarDayProps {
  calendarDate: CalendarDate;
  onSelectDate: (date: Date) => void;
}

function getDateTextColor(calendarDate: CalendarDate) {
  if (isFutureDate(calendarDate.date)) {
    return 'text-[#cfcfcf]';
  }

  if (!calendarDate.isCurrentMonth) {
    return 'text-[#a1a1a1]';
  }

  const dayOfWeek = calendarDate.date.getDay();

  if (dayOfWeek === 0) {
    return 'text-[#ff6f41]';
  }

  if (dayOfWeek === 6) {
    return 'text-[#7dc3ff]';
  }

  return 'text-[#1c1c1c]';
}

function TravelDateCalendarDay({
  calendarDate,
  onSelectDate,
}: TravelDateCalendarDayProps) {
  const isDisabled = isFutureDate(calendarDate.date);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelectDate(calendarDate.date)}
      className={`relative z-10 flex h-[22px] w-[22px] items-center justify-center text-center text-[12px] leading-none font-medium disabled:cursor-not-allowed ${getDateTextColor(calendarDate)}`}
    >
      {calendarDate.day}
    </button>
  );
}

export default TravelDateCalendarDay;
