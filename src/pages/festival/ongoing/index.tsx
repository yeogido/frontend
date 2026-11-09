import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ContentCardSkeleton,
  FestivalContentCard,
  FestivalDeleteDialog,
} from '../../../components/common';
import { useCultureContents } from '../../../hooks/useCultureContents';
import { useContentDelete } from '../../../hooks/useContentDelete';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import { useEditFestival } from '../../../hooks/useEditFestival';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { toContentTagIds } from '../../../utils/contentTags';
import { buildFestivalDetailPath } from '../../../utils/routes';
import type { ContentCategory, ContentSort } from '../../../types/content.type';

import {
  FestivalCalendar,
  FestivalFilterBar,
  FestivalListCard,
  FestivalListCardSkeleton,
} from '../components';
import type { FestivalViewMode } from '../constants/filters';
import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import useFestivalFilters from '../hooks/useFestivalFilters';
import type { FestivalDateRange } from '../utils/festivalCalendar';
import { getFestivalListQuery } from '../utils/festivalListQuery';

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
const TOTAL_COUNT_MARGIN_TOP = 16;
const TOTAL_COUNT_SIZE = 12;
const CALENDAR_LIST_MARGIN_TOP = 12;
const CALENDAR_LIST_GAP = 12;
const EMPTY_MARGIN_TOP = 40;
const ERROR_MARGIN_TOP = 24;
const MESSAGE_TEXT_SIZE = 13;
const LOAD_MORE_HEIGHT = 40;
const PAGE_SIZE = 20;

// festival/search와 동일한 필터 매핑 — 페이지마다 로컬로 둔다(다른 화면과
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

function getEmptyMessage(
  viewMode: FestivalViewMode,
  dateRange: FestivalDateRange | null
) {
  if (viewMode === 'grid') return '진행 중인 행사가 없습니다.';

  return dateRange
    ? '선택한 기간에 열리는 행사가 없습니다.'
    : '올라와 있는 행사가 없습니다.';
}

function FestivalOngoingPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const [searchParams] = useSearchParams();
  // region-info의 "OO에서 진행 중인 행사" 미리보기 → 전체보기로 들어올 때만
  // 채워진다. RegionCourseSection의 전체보기 링크와 동일하게 지역명을
  // keyword로 넘긴다(regionId 대신 — 이미 이 방식으로 결과가 일치함을
  // 확인했다).
  const region = searchParams.get('region') ?? '';
  const { getLiked, toggleLike } = useContentLikeToggle();
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps } = useContentDelete();
  const {
    selectedFilters,
    viewMode,
    selectedDateRange,
    calendarMonth,
    handleSortSelect,
    handleCategorySelect,
    handleViewModeToggle,
    handleDateSelect,
    handleCalendarMonthChange,
  } = useFestivalFilters();
  const isCalendarMode = viewMode === 'calendar';
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
    isError,
    isFetchingNextPage,
    isPending,
  } = useCultureContents(
    {
      ...getFestivalListQuery(viewMode, selectedDateRange),
      keyword: region || undefined,
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

  const festivals = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount;
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
            {region ? `${region}에서 진행 중인 행사` : '진행 중인 행사'}
          </h1>
          <p
            className="text-gray-5 font-normal"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            지금 참여할 수 있는 행사를 만나보세요
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
          viewMode={viewMode}
          onViewModeToggle={handleViewModeToggle}
        />

        {isCalendarMode ? (
          <>
            <div style={{ marginTop: LIST_MARGIN_TOP * scale }}>
              <FestivalCalendar
                month={calendarMonth}
                selectedRange={selectedDateRange}
                onMonthChange={handleCalendarMonthChange}
                onDateSelect={handleDateSelect}
              />
            </div>

            <p
              aria-live="polite"
              className="text-gray-4 font-medium"
              style={{
                marginTop: TOTAL_COUNT_MARGIN_TOP * scale,
                fontSize: TOTAL_COUNT_SIZE * scale,
                lineHeight: 1,
                minHeight: TOTAL_COUNT_SIZE * scale,
              }}
            >
              {!isPending && !isError && totalCount !== undefined
                ? `총 ${totalCount.toLocaleString()}개`
                : null}
            </p>

            <div
              className="flex flex-col"
              style={{
                marginTop: CALENDAR_LIST_MARGIN_TOP * scale,
                gap: CALENDAR_LIST_GAP * scale,
              }}
            >
              {isPending
                ? FESTIVAL_SKELETON_ITEMS.slice(0, 4).map((item) => (
                    <FestivalListCardSkeleton key={item} />
                  ))
                : festivals.map((festival) => (
                    <FestivalListCard
                      key={festival.contentId}
                      image={festival.thumbnailImageUrl}
                      title={festival.title}
                      startDate={festival.startDate}
                      endDate={festival.endDate}
                      tags={toContentTagIds(festival.hashtags)}
                      isAdmin={festival.canManage}
                      liked={getLiked(festival.contentId, festival.isLiked)}
                      onClick={() =>
                        navigate(buildFestivalDetailPath(festival.contentId))
                      }
                      onLikeClick={() =>
                        toggleLike(
                          festival.contentId,
                          getLiked(festival.contentId, festival.isLiked)
                        )
                      }
                      onEdit={() => void editFestival(festival.contentId)}
                      onDelete={() => requestDelete(festival.contentId)}
                    />
                  ))}

              {isFetchingNextPage ? (
                <FestivalListCardSkeleton key="next-page" />
              ) : null}
            </div>
          </>
        ) : (
          <div
            className="grid grid-cols-2"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              columnGap: LIST_GAP * scale,
              rowGap: LIST_GAP * scale,
            }}
          >
            {isPending
              ? FESTIVAL_SKELETON_ITEMS.map((item) => (
                  <ContentCardSkeleton
                    key={item}
                    className="w-full"
                    imageClassName="aspect-[163/115] h-auto"
                  />
                ))
              : festivals.map((festival) => (
                  <FestivalContentCard
                    key={festival.contentId}
                    image={festival.thumbnailImageUrl}
                    title={festival.title}
                    startDate={festival.startDate}
                    endDate={festival.endDate}
                    regionName={festival.regionName}
                    tags={toContentTagIds(festival.hashtags)}
                    className="w-full"
                    isAdmin={festival.canManage}
                    liked={getLiked(festival.contentId, festival.isLiked)}
                    onClick={() =>
                      navigate(buildFestivalDetailPath(festival.contentId))
                    }
                    onLikeClick={() =>
                      toggleLike(
                        festival.contentId,
                        getLiked(festival.contentId, festival.isLiked)
                      )
                    }
                    onEdit={() => void editFestival(festival.contentId)}
                    onDelete={() => requestDelete(festival.contentId)}
                  />
                ))}

            {isFetchingNextPage
              ? FESTIVAL_SKELETON_ITEMS.slice(0, 2).map((item) => (
                  <ContentCardSkeleton
                    key={`next-page-${item}`}
                    className="w-full"
                    imageClassName="aspect-[163/115] h-auto"
                  />
                ))
              : null}
          </div>
        )}

        {hasEmptyResult ? (
          <p
            className="text-gray-4 text-center font-medium"
            style={{
              marginTop: EMPTY_MARGIN_TOP * scale,
              fontSize: MESSAGE_TEXT_SIZE * scale,
            }}
          >
            {getEmptyMessage(viewMode, selectedDateRange)}
          </p>
        ) : null}

        {isError ? (
          <p
            className="text-main-5 text-center font-medium"
            style={{
              marginTop: ERROR_MARGIN_TOP * scale,
              fontSize: MESSAGE_TEXT_SIZE * scale,
            }}
          >
            행사 목록을 불러오지 못했어요.
          </p>
        ) : null}

        <div
          ref={loadMoreRef}
          style={{ height: LOAD_MORE_HEIGHT * scale }}
          aria-hidden="true"
        />
      </section>
      <FestivalDeleteDialog {...dialogProps} />
    </>
  );
}

export default FestivalOngoingPage;
