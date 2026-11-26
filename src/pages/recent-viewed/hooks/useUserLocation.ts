import { useEffect, useState } from 'react';

import {
  readStoredUserLocation,
  resolveUserLocation,
  type UserLocation,
} from '../../../utils/geolocation';

/**
 * 거리 표시용 현재 위치. 거리를 보여줄 카드가 있을 때(enabled)만 묻고, 권한이
 * 거부됐거나 알 수 없으면 null이다. 좌표는 브라우저 안에서만 쓴다.
 */
export function useUserLocation(enabled: boolean): UserLocation | null {
  const [location, setLocation] = useState(readStoredUserLocation);

  useEffect(() => {
    if (!enabled || location) return;

    let isActive = true;

    void resolveUserLocation().then((next) => {
      if (isActive) setLocation(next);
    });

    return () => {
      isActive = false;
    };
  }, [enabled, location]);

  return location;
}
