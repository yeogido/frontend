import { useState } from 'react';

import {
  initialFestivalSelectedFilters,
  type FestivalCategoryValue,
  type FestivalSelectedFilters,
  type FestivalSortValue,
} from '../constants/filters';

function useFestivalFilters() {
  const [selectedFilters, setSelectedFilters] =
    useState<FestivalSelectedFilters>(initialFestivalSelectedFilters);

  const handleSortSelect = (sort: FestivalSortValue) => {
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      sort,
    }));
  };

  const handleCategorySelect = (category: FestivalCategoryValue) => {
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      category,
    }));
  };

  return {
    selectedFilters,
    handleSortSelect,
    handleCategorySelect,
  };
}

export default useFestivalFilters;
