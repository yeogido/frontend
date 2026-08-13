import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  initialYeogidoCourseSelectedFilters,
  yeogidoCourseFilterGroups,
  type YeogidoCourseFilterKey,
  type YeogidoCourseSelectedFilters,
} from '../constants/filters';

function useYeogidoCourseFilters(
  initialOverrides?: Partial<YeogidoCourseSelectedFilters>
) {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [openFilterKey, setOpenFilterKey] =
    useState<YeogidoCourseFilterKey | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // 페이지별 기본값(예: 인기 코스 페이지의 '인기순')은 URL에 없을 때만
  // 적용되는 fallback이다. 필터를 URL 쿼리 파라미터에 반영해, 상세
  // 페이지에서 뒤로가기로 돌아왔을 때도 선택값이 유지되게 한다.
  const defaultFilters: YeogidoCourseSelectedFilters = {
    ...initialYeogidoCourseSelectedFilters,
    ...initialOverrides,
  };

  const selectedFilters = yeogidoCourseFilterGroups.reduce(
    (filters, group) => {
      const paramValue = searchParams.get(group.key);
      filters[group.key] =
        paramValue && (group.options as readonly string[]).includes(paramValue)
          ? paramValue
          : defaultFilters[group.key];
      return filters;
    },
    {} as YeogidoCourseSelectedFilters
  );

  useEffect(() => {
    if (!openFilterKey) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (filterContainerRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpenFilterKey(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openFilterKey]);

  const handleFilterToggle = (filterKey: YeogidoCourseFilterKey) => {
    setOpenFilterKey((currentFilterKey) =>
      currentFilterKey === filterKey ? null : filterKey
    );
  };

  const handleFilterSelect = (
    filterKey: YeogidoCourseFilterKey,
    option: string
  ) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (option === defaultFilters[filterKey]) {
      nextSearchParams.delete(filterKey);
    } else {
      nextSearchParams.set(filterKey, option);
    }

    setSearchParams(nextSearchParams);
    setOpenFilterKey(null);
  };

  return {
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
  };
}

export default useYeogidoCourseFilters;
