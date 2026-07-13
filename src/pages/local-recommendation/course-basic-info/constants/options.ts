export const durationOptions = [
  { value: 'day-trip', label: '당일치기' },
  { value: '1-night-2-days', label: '1박 2일' },
  { value: '2-nights-3-days', label: '2박 3일' },
  { value: '3-nights-4-days', label: '3박 4일' },
  { value: '4-nights-or-more', label: '4박 5일 이상' },
] as const;

export const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}월`,
}));

export const transportOptions = [
  {
    value: 'walking',
    label: '뚜벅이',
    description: '대중교통과 도보로 이동',
  },
  { value: 'car', label: '자차', description: '자동차로 이동' },
] as const;

export const companionOptions = [
  { value: 'solo', label: '혼자' },
  { value: 'friends', label: '친구와' },
  { value: 'couple', label: '연인과' },
  { value: 'family', label: '가족과' },
  { value: 'children', label: '아이와' },
] as const;
