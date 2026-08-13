import { useEffect, useRef, useState } from 'react';

import {
  initialFestivalCoursesSelectedFilters,
  type FestivalCoursesFilterKey,
  type FestivalCoursesSelectedFilters,
} from '../constants/filters';

function useFestivalCoursesFilters() {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [openFilterKey, setOpenFilterKey] =
    useState<FestivalCoursesFilterKey | null>(null);
  const [selectedFilters, setSelectedFilters] =
    useState<FestivalCoursesSelectedFilters>(
      initialFestivalCoursesSelectedFilters
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

  const handleFilterToggle = (filterKey: FestivalCoursesFilterKey) => {
    setOpenFilterKey((currentFilterKey) =>
      currentFilterKey === filterKey ? null : filterKey
    );
  };

  const handleFilterSelect = (
    filterKey: FestivalCoursesFilterKey,
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

export default useFestivalCoursesFilters;
