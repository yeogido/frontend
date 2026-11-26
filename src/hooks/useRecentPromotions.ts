import { useEffect, useState } from 'react';

import { useAuthStore } from '../store/auth.store';
import {
  RECENT_PROMOTIONS_UPDATED_EVENT,
  getStoredRecentPromotions,
} from '../utils/recentPromotions';

/**
 * "최근 본 홍보글" 목록. 저장소(localStorage)를 읽어 보여주고, 같은 탭에서
 * 바뀌거나 로그인 계정이 바뀌면 다시 읽는다.
 */
export function useRecentPromotions() {
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const [promotions, setPromotions] = useState(getStoredRecentPromotions);
  const [storedAuthGeneration, setStoredAuthGeneration] =
    useState(authGeneration);

  if (storedAuthGeneration !== authGeneration) {
    setStoredAuthGeneration(authGeneration);
    setPromotions(getStoredRecentPromotions());
  }

  useEffect(() => {
    const handleUpdate = () => setPromotions(getStoredRecentPromotions());

    window.addEventListener(RECENT_PROMOTIONS_UPDATED_EVENT, handleUpdate);

    return () =>
      window.removeEventListener(RECENT_PROMOTIONS_UPDATED_EVENT, handleUpdate);
  }, []);

  return promotions;
}
