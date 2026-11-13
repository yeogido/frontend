import {
  ConfirmDialog,
  FloatingActionButton,
  PromotionCardSkeleton,
  RegionImageCarousel,
} from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';

import { BusinessGrid, BusinessList, BusinessToolbar } from './components';
import { regionImageOptions } from './constants';
import { useLocalBusinessList } from './hooks/useLocalBusinessList';

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
  const scale = useGlobalScale();
  const {
    isBusinessUser,
    selectedRegionId,
    selectedCategory,
    sortBy,
    viewMode,
    businesses,
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
  } = useLocalBusinessList();

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
              className="text-gray-4 text-center font-medium"
              style={{ fontSize: MESSAGE_TEXT_SIZE * scale }}
            >
              불러오는 중...
            </p>
          )
        ) : viewMode === 'grid' ? (
          <BusinessGrid
            businesses={businesses}
            onCardClick={handleCardClick}
            onLikeClick={(businessId) => void handleLikeClick(businessId)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            gapX={GRID_GAP_X * scale}
            gapY={GRID_GAP_Y * scale}
          />
        ) : (
          <BusinessList
            businesses={businesses}
            onCardClick={handleCardClick}
            onLikeClick={(businessId) => void handleLikeClick(businessId)}
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
          className="text-gray-4 text-center font-medium"
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
