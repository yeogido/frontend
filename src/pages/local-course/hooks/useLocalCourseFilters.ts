import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  initialLocalCourseSelectedFilters,
  localCourseFilterGroups,
  type LocalCourseFilterKey,
  type LocalCourseSelectedFilters,
} from '../constants/filters';

function useLocalCourseFilters() {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [openFilterKey, setOpenFilterKey] =
    useState<LocalCourseFilterKey | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // 필터를 URL 쿼리 파라미터에 반영해, 상세 페이지에서 뒤로가기로
  // 돌아왔을 때(컴포넌트가 다시 마운트돼도) 선택값이 유지되게 한다.
  const selectedFilters = localCourseFilterGroups.reduce(
    (filters, group) => {
      const paramValue = searchParams.get(group.key);
      filters[group.key] =
        paramValue && (group.options as readonly string[]).includes(paramValue)
          ? paramValue
          : initialLocalCourseSelectedFilters[group.key];
      return filters;
    },
    {} as LocalCourseSelectedFilters
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

  const handleFilterToggle = (filterKey: LocalCourseFilterKey) => {
    setOpenFilterKey((currentFilterKey) =>
      currentFilterKey === filterKey ? null : filterKey
    );
  };

  const handleFilterSelect = (
    filterKey: LocalCourseFilterKey,
    option: string
  ) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (option === initialLocalCourseSelectedFilters[filterKey]) {
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

export default useLocalCourseFilters;
