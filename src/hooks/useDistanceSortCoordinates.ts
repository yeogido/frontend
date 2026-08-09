import { useEffect, useState } from 'react';

import {
  getCurrentMapCoordinates,
  type MapCoordinates,
} from '../components/kakaomap/utils/kakaoMap';

/**
 * 거리순 정렬이 선택됐을 때만 위치 정보를 요청한다. 거리순 API는 위도/경도가
 * 없으면 400(COURSE4006)을 내려서, 좌표를 받기 전까지는 요청 자체를 막아야
 * 한다(호출부에서 이 값이 null일 동안 쿼리를 enabled: false로 둔다).
 * 권한 거부/실패 시에도 getCurrentMapCoordinates가 서울시청 좌표로
 * 대체해주므로 별도 에러 처리는 필요 없다.
 */
export function useDistanceSortCoordinates(isDistanceSortActive: boolean) {
  const [coordinates, setCoordinates] = useState<MapCoordinates | null>(null);

  useEffect(() => {
    if (!isDistanceSortActive || coordinates) return;

    let cancelled = false;

    void getCurrentMapCoordinates().then((coords) => {
      if (!cancelled) setCoordinates(coords);
    });

    return () => {
      cancelled = true;
    };
  }, [isDistanceSortActive, coordinates]);

  return coordinates;
}
