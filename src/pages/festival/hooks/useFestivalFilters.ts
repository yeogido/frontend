import { useSearchParams } from 'react-router-dom';

import {
  festivalCategoryOptions,
  festivalSortOptions,
  initialFestivalSelectedFilters,
  type FestivalCategoryValue,
  type FestivalSelectedFilters,
  type FestivalSortValue,
  type FestivalViewMode,
} from '../constants/filters';
import {
  formatFestivalMonthValue,
  getNextFestivalDateRange,
  parseFestivalDateRange,
  resolveFestivalCalendarMonth,
  type FestivalCalendarMonth,
} from '../utils/festivalCalendar';

function isFestivalCategoryValue(
  value: string | null
): value is FestivalCategoryValue {
  return festivalCategoryOptions.some((option) => option.value === value);
}

function isFestivalSortValue(value: string | null): value is FestivalSortValue {
  return festivalSortOptions.some((option) => option.value === value);
}

function useFestivalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 필터를 URL 쿼리 파라미터에 반영해, 상세 페이지에서 뒤로가기로
  // 돌아왔을 때(컴포넌트가 다시 마운트돼도) 선택값이 유지되게 한다.
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort');
  const selectedFilters: FestivalSelectedFilters = {
    category: isFestivalCategoryValue(categoryParam)
      ? categoryParam
      : initialFestivalSelectedFilters.category,
    sort: isFestivalSortValue(sortParam)
      ? sortParam
      : initialFestivalSelectedFilters.sort,
  };
  // 행사 일정(달력) 보기의 상태도 같은 이유로 URL에 둔다.
  const viewMode: FestivalViewMode =
    searchParams.get('view') === 'calendar' ? 'calendar' : 'grid';
  const selectedDateRange = parseFestivalDateRange(
    searchParams.get('start'),
    searchParams.get('end')
  );
  const calendarMonth = resolveFestivalCalendarMonth(
    searchParams.get('month'),
    selectedDateRange
  );

  const handleSortSelect = (sort: FestivalSortValue) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (sort === initialFestivalSelectedFilters.sort) {
      nextSearchParams.delete('sort');
    } else {
      nextSearchParams.set('sort', sort);
    }

    setSearchParams(nextSearchParams);
  };

  const handleCategorySelect = (category: FestivalCategoryValue) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (category === initialFestivalSelectedFilters.category) {
      nextSearchParams.delete('category');
    } else {
      nextSearchParams.set('category', category);
    }

    setSearchParams(nextSearchParams);
  };

  const handleViewModeToggle = () => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (viewMode === 'calendar') {
      nextSearchParams.delete('view');
    } else {
      nextSearchParams.set('view', 'calendar');
    }

    setSearchParams(nextSearchParams);
  };

  // 날짜를 누를 때마다 기록이 쌓이면 뒤로가기가 날짜 선택을 한 단계씩
  // 되돌리게 된다. 날짜·달 이동은 현재 기록을 바꿔치기한다.
  const handleDateSelect = (date: string) => {
    const nextRange = getNextFestivalDateRange(selectedDateRange, date);
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set('start', nextRange.startDate);
    if (nextRange.endDate === null) {
      nextSearchParams.delete('end');
    } else {
      nextSearchParams.set('end', nextRange.endDate);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleCalendarMonthChange = (month: FestivalCalendarMonth) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set('month', formatFestivalMonthValue(month));
    setSearchParams(nextSearchParams, { replace: true });
  };

  return {
    selectedFilters,
    viewMode,
    selectedDateRange,
    calendarMonth,
    handleSortSelect,
    handleCategorySelect,
    handleViewModeToggle,
    handleDateSelect,
    handleCalendarMonthChange,
  };
}

export default useFestivalFilters;
