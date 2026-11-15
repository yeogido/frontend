import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { addPlaceLike, removePlaceLike } from '../../../../apis/courses';
import { getApiErrorMessage } from '../../../../apis/common';
import type { NormalizedApiError } from '../../../../apis/common';
import type { GeoPoint } from '../../../../components/kakaomap/types';
import { useToast } from '../../../../components/toast';
import { useBusinessPromotionDelete } from '../../../../hooks/useBusinessPromotions';
import { useBusinessPromotionDetail } from '../../../../hooks/useBusinessPromotionDetail';
import { useLoginModal } from '../../../../hooks/useLoginModal';
import { useAuthStore } from '../../../../store/auth.store';
import { buildBusinessPromotionEditPath } from '../../../../utils/routes';
import { useShareToast } from '../../hooks/useShareToast';
import { mapBusinessPromotionDetail } from '../../mappers/businessPromotionDetailMapper';

const NOT_FOUND_MESSAGE = '업체 정보를 불러오지 못했습니다.';

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * 소상공인 홍보 상세 화면의 상태·데이터·동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 */
export function useLocalBusinessDetail(promotionId: number) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { openLoginModal } = useLoginModal();
  const { showToast } = useToast();
  const isValidPromotionId = Number.isInteger(promotionId) && promotionId > 0;
  const { data: detailResponse, error: queryError } =
    useBusinessPromotionDetail(promotionId);
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  // local-course 상세(CourseDetailLayout의 focusedStopId)와 같은 방식 —
  // 장소 카드를 누르면 지도를 그 자리로 되돌리고 핀을 강조한다. 핀이
  // 하나뿐이라 매번 같은 좌표를 다시 포커스하게 되는데, BaseKakaoMap의
  // panTo 이펙트는 focusedLocation "레퍼런스"가 바뀔 때만 다시 실행된다
  // — 값(위도/경도)이 아니라 객체 참조를 본다. 그래서 클릭할 때마다
  // 새 객체로 갈아끼워야, 지도를 옆으로 옮긴 뒤 같은 카드를 다시 눌러도
  // 포커스가 매번 다시 걸린다.
  const [focusedPlaceLocation, setFocusedPlaceLocation] =
    useState<GeoPoint | null>(null);
  const placeLikeRequestInFlightRef = useRef(false);
  const { copied, isToastVisible, handleShare } = useShareToast();
  const {
    requestDelete: requestPromotionDelete,
    dialogProps: promotionDeleteDialogProps,
  } = useBusinessPromotionDelete(() => navigate('/local-business'));
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

  // 비로그인 상태는 좋아요를 가질 수 없으므로, 로그아웃하면 이 화면이
  // 언마운트되지 않아도 눌러뒀던 하트 표시가 바로 풀리게 한다. 렌더 중에
  // 바로 반영해야 해서(useEffect의 setState는 린트로 금지) 이전 인증
  // 상태와 비교해 바뀐 순간 초기화한다.
  if (wasAuthenticated !== isAuthenticated) {
    setWasAuthenticated(isAuthenticated);

    if (!isAuthenticated) {
      setLikedOverride(null);
    }
  }

  const business = detailResponse
    ? mapBusinessPromotionDetail(detailResponse)
    : null;

  const errorMessage = !isValidPromotionId
    ? NOT_FOUND_MESSAGE
    : queryError
      ? isNormalizedApiError(queryError)
        ? queryError.message
        : NOT_FOUND_MESSAGE
      : null;

  const handleFavoriteToggle = async () => {
    if (placeLikeRequestInFlightRef.current) return;

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (!business) return;

    const nextLiked = !(likedOverride ?? business.liked);
    const requestAuthGeneration = useAuthStore.getState().authGeneration;
    placeLikeRequestInFlightRef.current = true;
    setLikedOverride(nextLiked);

    try {
      if (nextLiked) {
        await addPlaceLike(business.placeId, 'PROMOTION', promotionId);
      } else {
        await removePlaceLike(business.placeId);
      }
    } catch (error) {
      // 요청이 나간 뒤 로그아웃(또는 재로그인)해서 인증 세대가 바뀌었다면,
      // 지금은 이 실패를 되돌릴 세션이 아니므로 override를 건드리지 않는다.
      if (useAuthStore.getState().authGeneration === requestAuthGeneration) {
        setLikedOverride(!nextLiked);
      }

      if (isNormalizedApiError(error) && error.code === 'AUTH4011') {
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
      placeLikeRequestInFlightRef.current = false;
    }
  };

  // festival/index.tsx의 handleBack과 동일한 패턴 — history.state.idx가
  // 0이면 이 탭에서 처음 들어온 화면(직접 링크 진입 등)이라 뒤로 갈 곳이
  // 없다, 그때만 목록으로 대체 이동한다.
  const handleBack = () => {
    const cameFromBusinessPromotionFlow = Boolean(
      (location.state as { fromBusinessPromotionFlow?: boolean } | null)
        ?.fromBusinessPromotionFlow
    );

    if (cameFromBusinessPromotionFlow) {
      navigate('/local-business', { replace: true });
      return;
    }

    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/local-business', { replace: true });
    }
  };

  const editPromotion = (id: number) =>
    navigate(buildBusinessPromotionEditPath(id));

  return {
    business,
    errorMessage,
    likedOverride,
    handleFavoriteToggle,
    focusedPlaceLocation,
    setFocusedPlaceLocation,
    copied,
    isToastVisible,
    handleShare,
    requestPromotionDelete,
    promotionDeleteDialogProps,
    handleBack,
    editPromotion,
  };
}
