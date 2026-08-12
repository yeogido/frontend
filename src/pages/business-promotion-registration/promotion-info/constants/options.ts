export const dayOfWeekOptions = [
  { value: 'SUNDAY', label: '일' },
  { value: 'MONDAY', label: '월' },
  { value: 'TUESDAY', label: '화' },
  { value: 'WEDNESDAY', label: '수' },
  { value: 'THURSDAY', label: '목' },
  { value: 'FRIDAY', label: '금' },
  { value: 'SATURDAY', label: '토' },
] as const;

// 30분 간격 "HH:mm" 옵션(00:00~23:30). Figma의 Dropdown2는 전체 시간 문자열을
// 한 번에 고르는 형태라, 시/분을 나눠 받지 않고 이 목록에서 통째로 고른다.
function buildTimeOptions() {
  const options: { value: string; label: string }[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push({ value: time, label: time });
    }
  }

  return options;
}

export const timeOptions = buildTimeOptions();
