import { useEffect, useRef, useState } from 'react';

import {
  initialMyPostSelectedFilters,
  type MyPostFilterKey,
  type MyPostSelectedFilters,
} from '../constants/filters';

function useMyPostFilters() {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [openFilterKey, setOpenFilterKey] = useState<MyPostFilterKey | null>(
    null
  );
  const [selectedFilters, setSelectedFilters] = useState<MyPostSelectedFilters>(
    initialMyPostSelectedFilters
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

  const handleFilterToggle = (filterKey: MyPostFilterKey) => {
    setOpenFilterKey((currentFilterKey) =>
      currentFilterKey === filterKey ? null : filterKey
    );
  };

  const handleFilterSelect = (filterKey: MyPostFilterKey, option: string) => {
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

export default useMyPostFilters;
