import {
  ContentCardSkeleton,
  FestivalContentCard,
  FestivalDeleteDialog,
} from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { toContentTagIds } from '../../../utils/contentTags';
import { FESTIVAL_SKELETON_ITEMS } from '../constants/ui';
import { useFestivalDay } from '../hooks/useFestivalDay';
import FestivalCalendar from './FestivalCalendar';
import FestivalFilterBar from './FestivalFilterBar';
import FestivalListCard, { FestivalListCardSkeleton } from './FestivalListCard';

// 모든 수치는 Figma 390 모바일 시안(6958:50508) 기준 리터럴 px
const CALENDAR_MARGIN_TOP = 32;
const DAY_PANEL_MARGIN_TOP = 16;
const DAY_PANEL_PADDING_X = 12;
const DAY_PANEL_PADDING_TOP = 16;
const DAY_PANEL_PADDING_BOTTOM = 16;
const DAY_PANEL_TITLE_SIZE = 16;
const DAY_PANEL_TITLE_LINE_HEIGHT = 21;
const DAY_PANEL_LIST_MARGIN_TOP = 24;
const DAY_PANEL_LIST_GAP = 20;
const DAY_PANEL_RADIUS = 12;
const FILTER_MARGIN_TOP = 32;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const MESSAGE_TEXT_SIZE = 13;
const EMPTY_MARGIN_TOP = 40;
const ERROR_MARGIN_TOP = 24;
const LOAD_MORE_HEIGHT = 40;
const DAY_PANEL_SKELETON_COUNT = 3;
const NEXT_PAGE_SKELETON_COUNT = 2;

/** "2026-08-06" → "8월 6일" */
function formatDayLabel(date: string) {
  return `${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일`;
}

/**
 * 모바일 행사 홈의 달력 아래 영역 — 달력, 고른 날짜의 추천 행사, 분류·정렬
 * 필터와 2열 행사 목록. 목록도 달력에서 고른 날짜에 열리는 행사만 보여준다.
 */
function FestivalHomeSections() {
  const scale = useGlobalScale();
  const {
    selectedFilters,
    handleCategorySelect,
    handleSortChange,
    calendarMonth,
    changeMonth,
    selectedDate,
    selectDate,
    festivals,
    dayFestivals,
    isPending,
    isError,
    isFetchingNextPage,
    isDayPanelPending,
    loadMoreRef,
    getLiked,
    toggleLike,
    goToFestival,
    editFestival,
    requestDelete,
    dialogProps,
  } = useFestivalDay();

  const hasEmptyResult = !isPending && !isError && festivals.length === 0;

  return (
    <>
      <div style={{ marginTop: CALENDAR_MARGIN_TOP * scale }}>
        <FestivalCalendar
          month={calendarMonth}
          selectedRange={{ startDate: selectedDate, endDate: null }}
          onMonthChange={changeMonth}
          onDateSelect={selectDate}
        />
      </div>

      <section
        aria-label="선택한 날짜의 행사"
        className="border border-[#e4e4e4] bg-[#f9f9f9]"
        style={{
          marginTop: DAY_PANEL_MARGIN_TOP * scale,
          paddingLeft: DAY_PANEL_PADDING_X * scale,
          paddingRight: DAY_PANEL_PADDING_X * scale,
          paddingTop: DAY_PANEL_PADDING_TOP * scale,
          paddingBottom: DAY_PANEL_PADDING_BOTTOM * scale,
          borderRadius: DAY_PANEL_RADIUS * scale,
        }}
      >
        <h2
          className="font-semibold text-black"
          style={{
            fontSize: DAY_PANEL_TITLE_SIZE * scale,
            lineHeight: `${DAY_PANEL_TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          {formatDayLabel(selectedDate)}, 이런 행사 어때요?
        </h2>

        <div
          className="flex flex-col"
          style={{
            marginTop: DAY_PANEL_LIST_MARGIN_TOP * scale,
            gap: DAY_PANEL_LIST_GAP * scale,
          }}
        >
          {isDayPanelPending
            ? Array.from({ length: DAY_PANEL_SKELETON_COUNT }, (_, index) => (
                <FestivalListCardSkeleton key={index} />
              ))
            : dayFestivals.map((festival) => (
                <FestivalListCard
                  key={festival.contentId}
                  image={festival.thumbnailImageUrl}
                  title={festival.title}
                  startDate={festival.startDate}
                  endDate={festival.endDate}
                  tags={toContentTagIds(festival.hashtags)}
                  isAdmin={festival.canManage}
                  liked={getLiked(festival.contentId, festival.isLiked)}
                  onClick={() => goToFestival(festival.contentId)}
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

          {!isDayPanelPending && dayFestivals.length === 0 ? (
            <p
              className="text-gray-4 text-center font-medium"
              style={{ fontSize: MESSAGE_TEXT_SIZE * scale }}
            >
              이 날 열리는 행사가 없어요.
            </p>
          ) : null}
        </div>
      </section>

      <div style={{ marginTop: FILTER_MARGIN_TOP * scale }}>
        <FestivalFilterBar
          selectedSort={selectedFilters.sort}
          selectedCategory={selectedFilters.category}
          onSortSelect={handleSortChange}
          onCategorySelect={handleCategorySelect}
        />
      </div>

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
                onClick={() => goToFestival(festival.contentId)}
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
          ? FESTIVAL_SKELETON_ITEMS.slice(0, NEXT_PAGE_SKELETON_COUNT).map(
              (item) => (
                <ContentCardSkeleton
                  key={`next-page-${item}`}
                  className="w-full"
                  imageClassName="aspect-[163/115] h-auto"
                />
              )
            )
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
          선택한 날짜에 열리는 행사가 없습니다.
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
      <FestivalDeleteDialog {...dialogProps} />
    </>
  );
}

export default FestivalHomeSections;
