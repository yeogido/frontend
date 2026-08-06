const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = 6;

export const yearOptions = Array.from({ length: YEAR_RANGE }, (_, index) => {
  const year = String(CURRENT_YEAR + index);
  return { value: year, label: `${year}년` };
});

export const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = String(index + 1).padStart(2, '0');
  return { value: month, label: `${index + 1}월` };
});

export const dayOptions = Array.from({ length: 31 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0');
  return { value: day, label: `${index + 1}일` };
});
