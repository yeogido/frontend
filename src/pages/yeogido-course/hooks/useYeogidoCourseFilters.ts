import { useEffect, useRef, useState } from 'react';

import {
  initialYeogidoCourseSelectedFilters,
  type YeogidoCourseFilterKey,
  type YeogidoCourseSelectedFilters,
} from '../constants/filters';

function useYeogidoCourseFilters(
  initialOverrides?: Partial<YeogidoCourseSelectedFilters>
) {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [openFilterKey, setOpenFilterKey] =
    useState<YeogidoCourseFilterKey | null>(null);
  const [selectedFilters, setSelectedFilters] =
    useState<YeogidoCourseSelectedFilters>(() => ({
      ...initialYeogidoCourseSelectedFilters,
      ...initialOverrides,
    }));

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

export default useYeogidoCourseFilters;
