import { useEffect, useRef, useState } from 'react';

import {
  initialLocalCourseSelectedFilters,
  type LocalCourseFilterKey,
  type LocalCourseSelectedFilters,
} from '../constants/filters';

function useLocalCourseFilters() {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [openFilterKey, setOpenFilterKey] =
    useState<LocalCourseFilterKey | null>(null);
  const [selectedFilters, setSelectedFilters] =
    useState<LocalCourseSelectedFilters>(initialLocalCourseSelectedFilters);

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
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      [filterKey]: option,
    }));
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
