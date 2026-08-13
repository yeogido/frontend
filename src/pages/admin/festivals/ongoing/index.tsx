import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ConfirmDialog,
  ContentCardSkeleton,
  EditableContentCard,
} from '../../../../components/common';
import { useContentDelete } from '../../../../hooks/useContentDelete';
import { useCultureContents } from '../../../../hooks/useCultureContents';
import { useDistanceSortCoordinates } from '../../../../hooks/useDistanceSortCoordinates';
import { useEditFestival } from '../../../../hooks/useEditFestival';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import useInfiniteScroll from '../../../../hooks/useInfiniteScroll';
import { toContentTagIds } from '../../../../utils/contentTags';
import { buildFestivalDetailPath } from '../../../../utils/routes';
import type {
  ContentCategory,
  ContentSort,
} from '../../../../types/content.type';

import { FestivalFilterBar } from '../../../festival/components';
import useFestivalFilters from '../../../festival/hooks/useFestivalFilters';

// festival/ongoing과 동일한 필터 매핑 — 페이지마다 로컬로 둔다(다른 화면과
// 공유하는 순간 한쪽만 옵션이 바뀌어도 매핑이 깨질 수 있다).
const categoryByFilterValue: Record<string, ContentCategory | undefined> = {
  ALL: undefined,
  EXPERIENCE: 'EXPERIENCE',
  EXHIBITION: 'EXHIBITION',
  PERFORMANCE: 'PERFORMANCE',
  FESTIVAL: 'FESTIVAL',
};

const sortByFilterValue: Record<string, ContentSort> = {
  RECOMMENDED: 'RECOMMEND',
  SAVED: 'LIKE',
  DISTANCE: 'DISTANCE',
  ENDING_SOON: 'DEADLINE',
};

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const ERROR_MARGIN_TOP = 24;
const MESSAGE_TEXT_SIZE = 13;
const SKELETON_ITEMS = [0, 1, 2, 3];
const RETRY_PADDING_X = 16;
const RETRY_PADDING_Y = 8;
const RETRY_TEXT_SIZE = 14;
const LOAD_MORE_HEIGHT = 40;
const PAGE_SIZE = 20;

/** 관리자 전용 "진행 중인 행사" 전체보기 — 좋아요 대신 수정/삭제 카드로 보여준다. */
function AdminFestivalsOngoingPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { selectedFilters, handleSortSelect, handleCategorySelect } =
    useFestivalFilters();
  const isDistanceSort = selectedFilters.sort === 'DISTANCE';
  const {
    coordinates: distanceSortCoordinates,
    status,
    requestCoordinates,
  } = useDistanceSortCoordinates();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isPending,
    isError,
    isFetchingNextPage,
    refetch,
  } = useCultureContents(
    {
      statuses: ['ONGOING'],
      category: categoryByFilterValue[selectedFilters.category],
      sort: sortByFilterValue[selectedFilters.sort],
      latitude: isDistanceSort ? distanceSortCoordinates?.latitude : undefined,
      longitude: isDistanceSort
        ? distanceSortCoordinates?.longitude
        : undefined,
      size: PAGE_SIZE,
    },
    { enabled: !isDistanceSort || status === 'ready' || status === 'failed' }
  );
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps } = useContentDelete();

  const festivals = data?.pages.flatMap((page) => page.items) ?? [];
  const hasEmptyResult = !isPending && !isError && festivals.length === 0;

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  return (
    <>
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
            진행 중인 행사
          </h1>
          <p
            className="text-gray-5 font-normal"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            등록된 행사를 확인하고 수정하거나 삭제할 수 있어요
          </p>
        </div>

        <FestivalFilterBar
          selectedSort={selectedFilters.sort}
          selectedCategory={selectedFilters.category}
          onSortSelect={(sort) => {
            handleSortSelect(sort);
            if (sort === 'DISTANCE') {
              void requestCoordinates();
            }
          }}
          onCategorySelect={handleCategorySelect}
        />

        <div
          className="grid grid-cols-2"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            columnGap: LIST_GAP * scale,
            rowGap: LIST_GAP * scale,
          }}
        >
          {isPending
            ? SKELETON_ITEMS.map((item) => (
                <ContentCardSkeleton
                  key={item}
                  className="w-full"
                  imageClassName="aspect-[163/115] h-auto"
                />
              ))
            : festivals.map((festival) => (
                <EditableContentCard
                  key={festival.contentId}
                  image={festival.thumbnailImageUrl}
                  title={festival.title}
                  firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                  secondInfo={festival.regionName}
                  tags={toContentTagIds(festival.hashtags)}
                  className="w-full"
                  onClick={() =>
                    navigate(buildFestivalDetailPath(festival.contentId))
                  }
                  onEdit={() => void editFestival(festival.contentId)}
                  onDelete={() => requestDelete(festival.contentId)}
                />
              ))}

          {isFetchingNextPage
            ? SKELETON_ITEMS.slice(0, 2).map((item) => (
                <ContentCardSkeleton
                  key={`next-page-${item}`}
                  className="w-full"
                  imageClassName="aspect-[163/115] h-auto"
                />
              ))
            : null}
        </div>

        {hasEmptyResult ? (
          <p
            className="text-gray-4 text-center font-medium"
            style={{
              marginTop: EMPTY_MARGIN_TOP * scale,
              fontSize: MESSAGE_TEXT_SIZE * scale,
            }}
          >
            진행 중인 행사가 없습니다.
          </p>
        ) : null}

        {isError ? (
          <div
            className="flex flex-col items-center"
            style={{
              marginTop: ERROR_MARGIN_TOP * scale,
              gap: ERROR_MARGIN_TOP * scale,
            }}
          >
            <p
              className="text-main-5 text-center font-medium"
              style={{ fontSize: MESSAGE_TEXT_SIZE * scale }}
            >
              행사 목록을 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-full border border-[#e4e4e4] font-medium text-[#505050]"
              style={{
                paddingLeft: RETRY_PADDING_X * scale,
                paddingRight: RETRY_PADDING_X * scale,
                paddingTop: RETRY_PADDING_Y * scale,
                paddingBottom: RETRY_PADDING_Y * scale,
                fontSize: RETRY_TEXT_SIZE * scale,
              }}
            >
              다시 시도
            </button>
          </div>
        ) : null}

        <div
          ref={loadMoreRef}
          style={{ height: LOAD_MORE_HEIGHT * scale }}
          aria-hidden="true"
        />
      </section>
      <ConfirmDialog
        {...dialogProps}
        title="행사를 삭제할까요?"
        description="삭제한 행사는 되돌릴 수 없어요."
      />
    </>
  );
}

export default AdminFestivalsOngoingPage;
