import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { addPlaceLike, removePlaceLike } from '../../../apis/courses';
import { getApiErrorMessage, normalizeApiError } from '../../../apis/common';
import { REGION_IMAGE_ALL_ID } from '../../../components/common/RegionImageCarouselOption';
import { useToast } from '../../../components/toast';
import { REGION_CITY_IDS } from '../../../constants/regions';
import type { RegionCityId } from '../../../constants/regions';
import { useBusinessPromotionDelete } from '../../../hooks/useBusinessPromotions';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useIsBusinessUser } from '../../../hooks/useMyProfile';
import { useAuthStore } from '../../../store/auth.store';
import {
  buildBusinessPromotionEditPath,
  buildLocalBusinessDetailPath,
} from '../../../utils/routes';
import { businessCategories, businessSortOptions } from '../constants';
import type {
  BusinessCategory,
  BusinessSort,
  BusinessViewMode,
} from '../types';
import useLocalBusinesses from './useLocalBusinesses';

const DEFAULT_CATEGORY: BusinessCategory = '전체';
const DEFAULT_SORT: BusinessSort = '추천순';
const DEFAULT_VIEW_MODE: BusinessViewMode = 'card';

/**
 * 지역 소상공인 홍보 목록 화면의 상태·데이터·동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 */
export function useLocalBusinessList() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isBusinessUser = useIsBusinessUser();
  const { openLoginModal } = useLoginModal();
  const { showToast } = useToast();
  // 지역/카테고리/정렬/보기모드를 전부 별도 state로 복제해두면(예전 방식),
  // 값을 바꿔도 URL은 그대로라 상세 페이지로 갔다가 뒤로가기로
  // 돌아왔을 때(컴포넌트가 통째로 리마운트됨) 다시 기본값으로 되돌아가는
  // 버그가 있었다. URL을 단일 진실 공급원으로 두고 매 렌더 파생시키면,
  // 변경도 브라우저 히스토리에 남아 뒤로가기로 돌아와도 그대로 유지된다.
  const [searchParams, setSearchParams] = useSearchParams();
  const regionParam = searchParams.get('region');
  // 지역 캐러셀 첫 항목이 '전국'이라 기본값도 전국이다. URL에 지역이 없거나
  // 모르는 값이면(전국 선택 시의 'all' 포함) 전국으로 떨어진다.
  const selectedRegionId: RegionCityId | typeof REGION_IMAGE_ALL_ID =
    REGION_CITY_IDS.includes(regionParam as RegionCityId)
      ? (regionParam as RegionCityId)
      : REGION_IMAGE_ALL_ID;

  const categoryParam = searchParams.get('category');
  const selectedCategory = businessCategories.includes(
    categoryParam as BusinessCategory
  )
    ? (categoryParam as BusinessCategory)
    : DEFAULT_CATEGORY;

  const sortParam = searchParams.get('sort');
  const sortBy = businessSortOptions.includes(sortParam as BusinessSort)
    ? (sortParam as BusinessSort)
    : DEFAULT_SORT;

  const viewParam = searchParams.get('view');
  const viewMode: BusinessViewMode =
    viewParam === 'grid' || viewParam === 'card'
      ? viewParam
      : DEFAULT_VIEW_MODE;

  const updateSearchParam = (key: string, value: string) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set(key, value);
      return next;
    });
  };

  const { businesses, isError, isFetchingNextPage, isPending, loadMoreRef } =
    useLocalBusinesses({
      selectedCategory,
      sortBy,
      selectedRegionId,
    });
  const hasEmptyResult = !isPending && !isError && businesses.length === 0;

  const {
    requestDelete: requestPromotionDelete,
    dialogProps: promotionDeleteDialogProps,
  } = useBusinessPromotionDelete();

  // 상세페이지(handleFavoriteToggle)와 동일한 낙관적 업데이트 패턴 —
  // 서버 응답을 기다리지 않고 먼저 하트를 바꾸고, 실패하면 되돌린다.
  const [likedOverrides, setLikedOverrides] = useState<Record<string, boolean>>(
    {}
  );
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

  // 비로그인 상태는 좋아요를 가질 수 없으므로, 로그아웃하면 이 화면이
  // 언마운트되지 않아도 눌러뒀던 하트 표시가 바로 풀리게 한다. 렌더 중에
  // 바로 반영해야 해서(useEffect의 setState는 린트로 금지) 이전 인증
  // 상태와 비교해 바뀐 순간 초기화한다.
  if (wasAuthenticated !== isAuthenticated) {
    setWasAuthenticated(isAuthenticated);

    if (!isAuthenticated) {
      setLikedOverrides({});
    }
  }
  const businessesWithLikeOverrides = businesses.map((business) => ({
    ...business,
    liked: likedOverrides[business.id] ?? business.liked,
  }));

  // 카드가 여러 장이라 상세페이지처럼 boolean 하나로는 안 되고, 카드별로
  // 이미 요청 중인지 따로 추적해야 한다 — 같은 카드 연타만 막고, 다른
  // 카드는 동시에 눌러도 되게 businessId 단위 Set을 쓴다.
  const likeRequestInFlightRef = useRef<Set<string>>(new Set());

  const handleCardClick = (businessId: string) => {
    navigate(buildLocalBusinessDetailPath(businessId));
  };

  const handleEditClick = (businessId: string) => {
    navigate(buildBusinessPromotionEditPath(businessId));
  };

  const handleDeleteClick = (businessId: string) => {
    requestPromotionDelete(Number(businessId));
  };

  const handleLikeClick = async (businessId: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (likeRequestInFlightRef.current.has(businessId)) return;

    const business = businessesWithLikeOverrides.find(
      (item) => item.id === businessId
    );
    if (!business) return;

    const nextLiked = !business.liked;
    likeRequestInFlightRef.current.add(businessId);
    setLikedOverrides((previous) => ({ ...previous, [businessId]: nextLiked }));

    try {
      if (nextLiked) {
        await addPlaceLike(business.placeId, 'PROMOTION', Number(businessId));
      } else {
        await removePlaceLike(business.placeId);
      }
    } catch (error) {
      setLikedOverrides((previous) => ({
        ...previous,
        [businessId]: !nextLiked,
      }));

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
      likeRequestInFlightRef.current.delete(businessId);
    }
  };

  const handleSelectRegion = (region: { id: string }) => {
    updateSearchParam('region', region.id);
  };

  const handleSelectCategory = (category: BusinessCategory) => {
    updateSearchParam('category', category);
  };

  const handleSortChange = (sort: BusinessSort) => {
    updateSearchParam('sort', sort);
  };

  const handleToggleView = () => {
    updateSearchParam('view', viewMode === 'grid' ? 'card' : 'grid');
  };

  const handleStartPromotionRegistration = () => {
    navigate('/business-promotion-registration');
  };

  return {
    isBusinessUser,
    selectedRegionId,
    selectedCategory,
    sortBy,
    viewMode,
    businesses: businessesWithLikeOverrides,
    isPending,
    isError,
    isFetchingNextPage,
    hasEmptyResult,
    loadMoreRef,
    promotionDeleteDialogProps,
    handleCardClick,
    handleEditClick,
    handleDeleteClick,
    handleLikeClick,
    handleSelectRegion,
    handleSelectCategory,
    handleSortChange,
    handleToggleView,
    handleStartPromotionRegistration,
  };
}
