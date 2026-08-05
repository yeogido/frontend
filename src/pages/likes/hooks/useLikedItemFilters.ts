import { useEffect, useRef, useState } from 'react';

import {
  ALL_FILTER_OPTION,
  initialLikedItemSelectedFilters,
  type LikedItemFilterKey,
  type LikedItemSelectedFilters,
} from '../constants/filters';

/**
 * 좋아요 목록 필터 상태.
 * 1번째 필터(category)가 바뀌면 2번째 필터(detail) 옵션 자체가 바뀌므로
 * 이전 선택이 남지 않도록 '전체'로 되돌린다.
 */
function useLikedItemFilters() {
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [openFilterKey, setOpenFilterKey] = useState<LikedItemFilterKey | null>(
    null
  );
  const [selectedFilters, setSelectedFilters] =
    useState<LikedItemSelectedFilters>(initialLikedItemSelectedFilters);

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

  const handleFilterToggle = (filterKey: LikedItemFilterKey) => {
    setOpenFilterKey((currentFilterKey) =>
      currentFilterKey === filterKey ? null : filterKey
    );
  };

  const handleFilterSelect = (
    filterKey: LikedItemFilterKey,
    option: string
  ) => {
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      [filterKey]: option,
      ...(filterKey === 'category' ? { detail: ALL_FILTER_OPTION } : null),
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

export default useLikedItemFilters;
