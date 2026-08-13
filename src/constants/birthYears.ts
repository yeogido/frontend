const BIRTH_YEAR_START = 1915;
const BIRTH_YEAR_END = 2015;

export const BIRTH_YEARS = Array.from(
  { length: BIRTH_YEAR_END - BIRTH_YEAR_START + 1 },
  (_, index) => String(BIRTH_YEAR_END - index)
);
