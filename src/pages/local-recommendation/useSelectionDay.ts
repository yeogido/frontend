import { useSearchParams } from 'react-router-dom';

import { useLocalRecommendationStore } from '../../store/localRecommendation.store';

/**
 * 장소/행사 선택 화면이 어느 일차를 편집 중인지 읽는다. 쿼리(?day=2)가 없거나
 * 범위를 벗어나면 1일차로 본다.
 */
export function useSelectionDay() {
  const [searchParams] = useSearchParams();
  const totalDays = useLocalRecommendationStore(
    (state) => state.draft.totalDays
  );
  const requestedDay = Number(searchParams.get('day'));
  const day =
    Number.isInteger(requestedDay) && requestedDay >= 1
      ? Math.min(requestedDay, Math.max(totalDays, 1))
      : 1;

  return { day, dayIndex: day - 1, totalDays: Math.max(totalDays, 1) };
}
