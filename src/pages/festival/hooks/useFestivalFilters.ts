import { useSearchParams } from 'react-router-dom';

import {
  festivalCategoryOptions,
  festivalSortOptions,
  initialFestivalSelectedFilters,
  type FestivalCategoryValue,
  type FestivalSelectedFilters,
  type FestivalSortValue,
} from '../constants/filters';

function isFestivalCategoryValue(
  value: string | null
): value is FestivalCategoryValue {
  return festivalCategoryOptions.some((option) => option.value === value);
}

function isFestivalSortValue(
  value: string | null
): value is FestivalSortValue {
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

  return {
    selectedFilters,
    handleSortSelect,
    handleCategorySelect,
  };
}

export default useFestivalFilters;
