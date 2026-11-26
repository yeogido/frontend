import { useRef } from 'react';

import { getApiErrorMessage, normalizeApiError } from '../../../apis/common';
import { addPlaceLike, removePlaceLike } from '../../../apis/courses';
import { useToast } from '../../../components/toast';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import {
  updateRecentPromotionLikeState,
  type RecentPromotion,
} from '../../../utils/recentPromotions';

/**
 * 최근 본 홍보글의 좋아요. 소상공인 목록과 같은 낙관적 업데이트이며, 화면
 * 상태는 저장해 둔 스냅샷(liked)을 바로 고쳐서 반영한다.
 */
export function useRecentPromotionLike() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { openLoginModal } = useLoginModal();
  const { showToast } = useToast();
  const inFlightRef = useRef<Set<number>>(new Set());

  return async ({ promotionId, placeId, liked }: RecentPromotion) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (inFlightRef.current.has(promotionId)) return;

    inFlightRef.current.add(promotionId);
    updateRecentPromotionLikeState(promotionId, !liked);

    try {
      if (liked) {
        await removePlaceLike(placeId);
      } else {
        await addPlaceLike(placeId, 'PROMOTION', promotionId);
      }
    } catch (error) {
      updateRecentPromotionLikeState(promotionId, liked);

      if (normalizeApiError(error).code === 'AUTH4011') {
        clearAuth();
        openLoginModal();
        return;
      }

      showToast(
        getApiErrorMessage(
          error,
          '좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.'
        )
      );
    } finally {
      inFlightRef.current.delete(promotionId);
    }
  };
}
