import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useContentDelete } from '../../../hooks/useContentDelete';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useCultureContents } from '../../../hooks/useCultureContents';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import { useEditFestival } from '../../../hooks/useEditFestival';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import type { ContentCategory, ContentSort } from '../../../types/content.type';
import { buildFestivalDetailPath } from '../../../utils/routes';
import useFestivalFilters from '../hooks/useFestivalFilters';
import {
  formatFestivalDateValue,
  resolveFestivalCalendarMonth,
  shiftFestivalCalendarMonth,
  type FestivalCalendarMonth,
} from '../utils/festivalCalendar';

const PAGE_SIZE = 20;
const DAY_PANEL_SIZE = 3;

// 모바일 진행 중 행사 화면과 같은 필터 매핑. 페이지마다 로컬로 둔다.
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

/**
 * 데스크톱 행사 화면의 상태·데이터. 위쪽은 달력에서 고른 날짜의 추천 행사,
 * 아래쪽은 분류·정렬로 거른 진행 중 행사 목록이다.
 */
export function useFestivalDesktop() {
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useContentLikeToggle();
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps } = useContentDelete();
  const { selectedFilters, handleSortSelect, handleCategorySelect } =
    useFestivalFilters();
  const {
    coordinates: distanceSortCoordinates,
    status,
    requestCoordinates,
  } = useDistanceSortCoordinates();

  const [calendarMonth, setCalendarMonth] = useState<FestivalCalendarMonth>(
    () => resolveFestivalCalendarMonth(null, null)
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    formatFestivalDateValue(new Date())
  );

  const isDistanceSort = selectedFilters.sort === 'DISTANCE';

  const list = useCultureContents(
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

  // statuses를 보내지 않으면 날짜 조건과 하루라도 겹치는 행사를 모두 돌려준다.
  const dayPanel = useCultureContents({
    startDate: selectedDate,
    endDate: selectedDate,
    size: DAY_PANEL_SIZE,
  });

  const festivals = list.data?.pages.flatMap((page) => page.items) ?? [];
  const dayFestivals = (
    dayPanel.data?.pages.flatMap((page) => page.items) ?? []
  ).slice(0, DAY_PANEL_SIZE);

  const { hasNextPage, isFetchingNextPage, fetchNextPage, isPending } = list;
  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isPending,
    onIntersect: handleIntersect,
  });

  const handleSortChange = (sort: Parameters<typeof handleSortSelect>[0]) => {
    handleSortSelect(sort);
    if (sort === 'DISTANCE') {
      void requestCoordinates();
    }
  };

  const shiftMonth = (offset: number) =>
    setCalendarMonth((month) => shiftFestivalCalendarMonth(month, offset));

  /** 이웃 달의 날짜를 누르면 그 달로 넘어간다. */
  const selectDate = (date: string) => {
    setSelectedDate(date);
    setCalendarMonth(
      resolveFestivalCalendarMonth(date.slice(0, 7), null, new Date())
    );
  };

  const goToFestival = (contentId: number) =>
    navigate(buildFestivalDetailPath(contentId));

  return {
    selectedFilters,
    handleCategorySelect,
    handleSortChange,
    calendarMonth,
    shiftMonth,
    selectedDate,
    selectDate,
    festivals,
    dayFestivals,
    isPending,
    isError: list.isError,
    isFetchingNextPage,
    isDayPanelPending: dayPanel.isPending,
    loadMoreRef,
    getLiked,
    toggleLike,
    goToFestival,
    editFestival,
    requestDelete,
    dialogProps,
  };
}
