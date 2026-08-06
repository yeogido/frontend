const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function createCalendarDays(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const calendarDays: Array<number | null> = Array(42).fill(null);

  for (let day = 1; day <= lastDate; day += 1) {
    calendarDays[firstWeekday + day - 1] = day;
  }

  return calendarDays;
}

export function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDateValue(value: string) {
  const matched = DATE_VALUE_PATTERN.exec(value);
  if (!matched) return null;

  const year = Number(matched[1]);
  const month = Number(matched[2]) - 1;
  const day = Number(matched[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isFutureDate(date: Date, today: Date = new Date()) {
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return targetDate.getTime() > currentDate.getTime();
}

export function isFutureMonth(
  year: number,
  month: number,
  today: Date = new Date()
) {
  return (
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())
  );
}
