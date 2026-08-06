const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = 6;
const DEFAULT_DAYS_IN_MONTH = 31;

export const yearOptions = Array.from({ length: YEAR_RANGE }, (_, index) => {
  const year = String(CURRENT_YEAR + index);
  return { value: year, label: `${year}년` };
});

export const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = String(index + 1).padStart(2, '0');
  return { value: month, label: `${index + 1}월` };
});

/** 연/월이 아직 선택되지 않았으면 31일까지 보여준다 (선택 후 실제 일수로 좁혀짐). */
export function getDaysInMonth(year: string, month: string): number {
  const yearNum = Number(year);
  const monthNum = Number(month);

  if (!year || !month || !Number.isInteger(yearNum) || !Number.isInteger(monthNum)) {
    return DEFAULT_DAYS_IN_MONTH;
  }

  return new Date(yearNum, monthNum, 0).getDate();
}

export function getDayOptions(year: string, month: string) {
  const daysInMonth = getDaysInMonth(year, month);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = String(index + 1).padStart(2, '0');
    return { value: day, label: `${index + 1}일` };
  });
}
