const formatMonthDay = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${month}.${day}`;
};

/** 폴더 아래 기간 칩에 쓰는 "MM.DD - MM.DD". */
export const formatPeriodLabel = (startDate: Date, endDate: Date) =>
  `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}`;
