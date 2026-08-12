import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ConfirmDialog,
  FloatingActionButton,
  PromotionCardSkeleton,
  RegionImageCarousel,
} from '../../components/common';
import { DEFAULT_REGION_CITY_ID, REGION_CITY_IDS } from '../../constants/regions';
import type { RegionCityId } from '../../constants/regions';
import { useBusinessPromotionDelete } from '../../hooks/useBusinessPromotions';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useIsBusinessUser } from '../../hooks/useMyProfile';
import { useAuthStore } from '../../store/auth.store';
import {
  buildBusinessPromotionEditPath,
  buildLocalBusinessDetailPath,
} from '../../utils/routes';

import { BusinessGrid, BusinessList, BusinessToolbar } from './components';
import {
  businessCategories,
  businessSortOptions,
  regionImageOptions,
} from './constants';
import type { BusinessCategory, BusinessSort, BusinessViewMode } from './types';
import useLocalBusinesses from './hooks/useLocalBusinesses';

const DEFAULT_CATEGORY: BusinessCategory = '전체';
const DEFAULT_SORT: BusinessSort = '추천순';
const DEFAULT_VIEW_MODE: BusinessViewMode = 'grid';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const CAROUSEL_MARGIN_TOP = 12;
const LIST_MARGIN_TOP = 24;
const GRID_GAP_X = 16;
const GRID_GAP_Y = 18;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const MESSAGE_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;
const PENDING_SKELETON_COUNT = 4;

function LocalBusinessPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBusinessUser = useIsBusinessUser();
  const { openLoginModal } = useLoginModal();
  // 지역/카테고리/정렬/보기모드를 전부 별도 state로 복제해두면(예전 방식),
  // 값을 바꿔도 URL은 그대로라 상세 페이지로 갔다가 뒤로가기로
  // 돌아왔을 때(컴포넌트가 통째로 리마운트됨) 다시 기본값으로 되돌아가는
  // 버그가 있었다. URL을 단일 진실 공급원으로 두고 매 렌더 파생시키면,
  // 변경도 브라우저 히스토리에 남아 뒤로가기로 돌아와도 그대로 유지된다.
  const [searchParams, setSearchParams] = useSearchParams();

  const regionParam = searchParams.get('region');
  const selectedRegionId = REGION_CITY_IDS.includes(regionParam as RegionCityId)
    ? (regionParam as RegionCityId)
    : DEFAULT_REGION_CITY_ID;

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

  const {
    businesses,
    isError,
    isFetchingNextPage,
    isPending,
    loadMoreRef,
  } = useLocalBusinesses({
    selectedCategory,
    sortBy,
    selectedRegionId,
  });
  const hasEmptyResult = !isPending && !isError && businesses.length === 0;

  const { requestDelete: requestPromotionDelete, dialogProps: promotionDeleteDialogProps } =
    useBusinessPromotionDelete();

  // 소상공인 홍보 좋아요는 아직 백엔드 API가 없어, 상세페이지와 동일하게
  // 로컬 상태로만 토글한다(새로고침하면 초기화됨).
  const [likedOverrides, setLikedOverrides] = useState<
    Record<string, boolean>
  >({});
  const businessesWithLikeOverrides = businesses.map((business) => ({
    ...business,
    liked: likedOverrides[business.id] ?? business.liked,
  }));

  const handleCardClick = (businessId: string) => {
    navigate(buildLocalBusinessDetailPath(businessId));
  };

  const handleEditClick = (businessId: string) => {
    navigate(buildBusinessPromotionEditPath(businessId));
  };

  const handleDeleteClick = (businessId: string) => {
    requestPromotionDelete(Number(businessId));
  };

  const handleLikeClick = (businessId: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const current = businessesWithLikeOverrides.find(
      (business) => business.id === businessId
    )?.liked;

    setLikedOverrides((previous) => ({
      ...previous,
      [businessId]: !(current ?? false),
    }));
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

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          지역의 다양한 매력을 만나보세요
        </h1>

        <p
          className="text-gray-5 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          소상공인이 직접 소개하는 공간과 소식을 확인해 보세요
        </p>
      </div>

      <div style={{ marginTop: CAROUSEL_MARGIN_TOP * scale }}>
        <RegionImageCarousel
          options={regionImageOptions}
          selectedId={selectedRegionId}
          ariaLabel="지역 목록"
          onSelect={handleSelectRegion}
        />
      </div>

      <BusinessToolbar
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        viewMode={viewMode}
        onSelectCategory={handleSelectCategory}
        onSortChange={handleSortChange}
        onToggleView={handleToggleView}
      />

      <div style={{ marginTop: LIST_MARGIN_TOP * scale }}>
        {isPending ? (
          viewMode === 'card' ? (
            <div className="flex flex-col" style={{ gap: LIST_GAP * scale }}>
              {Array.from({ length: PENDING_SKELETON_COUNT }, (_, index) => (
                <PromotionCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <p
              className="text-center font-medium text-gray-4"
              style={{ fontSize: MESSAGE_TEXT_SIZE * scale }}
            >
              불러오는 중...
            </p>
          )
        ) : viewMode === 'grid' ? (
          <BusinessGrid
            businesses={businessesWithLikeOverrides}
            onCardClick={handleCardClick}
            onLikeClick={handleLikeClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            gapX={GRID_GAP_X * scale}
            gapY={GRID_GAP_Y * scale}
          />
        ) : (
          <BusinessList
            businesses={businessesWithLikeOverrides}
            onCardClick={handleCardClick}
            onLikeClick={handleLikeClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            gap={LIST_GAP * scale}
          />
        )}

        {isFetchingNextPage && viewMode === 'card' ? (
          <div
            className="flex flex-col"
            style={{ gap: LIST_GAP * scale, marginTop: LIST_GAP * scale }}
          >
            <PromotionCardSkeleton />
          </div>
        ) : null}
      </div>

      {hasEmptyResult ? (
        <p
          className="text-center font-medium text-gray-4"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          조건에 맞는 소상공인이 없습니다.
        </p>
      ) : null}

      {isError ? (
        <p
          className="text-main-5 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: MESSAGE_TEXT_SIZE * scale,
          }}
        >
          소상공인 목록을 불러오지 못했어요.
        </p>
      ) : null}

      <div
        ref={loadMoreRef}
        style={{ height: LOAD_MORE_HEIGHT * scale }}
        aria-hidden="true"
      />

      {isBusinessUser ? (
        <FloatingActionButton
          ariaLabel="홍보 게시물 등록"
          onClick={handleStartPromotionRegistration}
        />
      ) : null}

      <ConfirmDialog
        {...promotionDeleteDialogProps}
        title="홍보글을 삭제할까요?"
        description="삭제한 홍보글은 되돌릴 수 없어요."
      />
    </section>
  );
}

export default LocalBusinessPage;
