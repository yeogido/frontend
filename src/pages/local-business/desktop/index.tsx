import { MdAdd } from 'react-icons/md';

import { ConfirmDialog } from '../../../components/common';
import DesktopFilterChip from '../../../components/layout/desktop/DesktopFilterChip';
import DesktopFilterDropdown from '../../../components/layout/desktop/DesktopFilterDropdown';
import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
import {
  businessCategories,
  businessSortOptions,
  regionImageOptions,
} from '../constants';
import { useLocalBusinessList } from '../hooks/useLocalBusinessList';
import type { BusinessSort } from '../types';
import BusinessDesktopCard from './BusinessDesktopCard';
import BusinessRegionStrip from './BusinessRegionStrip';

// Figma 1440 데스크톱 시안(6336:75105) 기준 리터럴 px.
const CONTENT_WIDTH = 1048;
const TITLE_OFFSET_TOP = 60;
const SKELETON_COUNT = 6;
const SKELETON_HEIGHT = 350;

function LocalBusinessDesktopPage() {
  const {
    isBusinessUser,
    selectedRegionId,
    selectedCategory,
    sortBy,
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
    handleStartPromotionRegistration,
  } = useLocalBusinessList();

  return (
    <DesktopPageShell contentWidth={CONTENT_WIDTH}>
      <div
        style={{ paddingTop: TITLE_OFFSET_TOP }}
        className="flex flex-col gap-[32px]"
      >
        <header className="flex items-start justify-between">
          <div className="flex flex-col gap-[6px]">
            <h1 className="text-[32px] font-semibold text-black">
              지역의 다양한 매력을 만나보세요
            </h1>
            <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
              소상공인이 직접 소개하는 공간과 소식을 확인해 보세요
            </p>
          </div>

          {isBusinessUser ? (
            <button
              type="button"
              onClick={handleStartPromotionRegistration}
              className="bg-main-5 flex items-center gap-[4px] rounded-[12px] px-[16px] py-[10px] text-[16px] font-semibold text-white"
            >
              <MdAdd aria-hidden="true" className="text-[20px]" />
              홍보 게시물 등록
            </button>
          ) : null}
        </header>

        <BusinessRegionStrip
          options={regionImageOptions}
          selectedId={selectedRegionId}
          onSelect={handleSelectRegion}
        />

        <section className="flex flex-col gap-[32px]">
          <div className="flex items-center gap-[16px]">
            <DesktopFilterDropdown
              label="정렬"
              options={businessSortOptions}
              value={sortBy}
              onChange={(option) => handleSortChange(option as BusinessSort)}
            />
            {businessCategories.map((category) => (
              <DesktopFilterChip
                key={category}
                label={category}
                selected={selectedCategory === category}
                onClick={() => handleSelectCategory(category)}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-x-[24px] gap-y-[48px]">
            {isPending
              ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <div
                    key={index}
                    aria-hidden="true"
                    style={{ height: SKELETON_HEIGHT }}
                    className="bg-gray-2 animate-pulse rounded-[12px]"
                  />
                ))
              : businesses.map((business) => (
                  <BusinessDesktopCard
                    key={business.id}
                    business={business}
                    onClick={() => handleCardClick(business.id)}
                    onLikeClick={() => void handleLikeClick(business.id)}
                    onEdit={() => handleEditClick(business.id)}
                    onDelete={() => handleDeleteClick(business.id)}
                  />
                ))}
          </div>

          {isFetchingNextPage ? (
            <p className="text-gray-4 text-center text-[16px]">
              불러오는 중이에요.
            </p>
          ) : null}

          {hasEmptyResult ? (
            <p className="text-gray-4 text-center text-[16px] font-medium">
              조건에 맞는 소상공인이 없습니다.
            </p>
          ) : null}

          {isError ? (
            <p
              role="alert"
              className="text-main-5 text-center text-[16px] font-medium"
            >
              소상공인 목록을 불러오지 못했어요.
            </p>
          ) : null}

          <div ref={loadMoreRef} className="h-[40px]" aria-hidden="true" />
        </section>
      </div>

      <ConfirmDialog
        {...promotionDeleteDialogProps}
        title="홍보글을 삭제할까요?"
        description="삭제한 홍보글은 되돌릴 수 없어요."
      />
    </DesktopPageShell>
  );
}

export default LocalBusinessDesktopPage;
