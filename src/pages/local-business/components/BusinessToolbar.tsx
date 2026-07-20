import { businessCategories } from '../constants';
import type { BusinessCategory, BusinessSort, BusinessViewMode } from '../types';
import BusinessCategoryChips from './BusinessCategoryChips';
import BusinessSortDropdown from './BusinessSortDropdown';
import BusinessViewToggle from './BusinessViewToggle';

interface BusinessToolbarProps {
  selectedCategory: BusinessCategory;
  sortBy: BusinessSort;
  viewMode: BusinessViewMode;
  onSelectCategory: (category: BusinessCategory) => void;
  onSortChange: (value: BusinessSort) => void;
  onToggleView: () => void;
}

function BusinessToolbar({
  selectedCategory,
  sortBy,
  viewMode,
  onSelectCategory,
  onSortChange,
  onToggleView,
}: BusinessToolbarProps) {
  return (
    <div className="mt-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-2">
        <BusinessSortDropdown value={sortBy} onChange={onSortChange} />

        <BusinessViewToggle mode={viewMode} onToggle={onToggleView} />

        <BusinessCategoryChips
          selectedCategory={selectedCategory}
          categories={businessCategories}
          onSelectCategory={onSelectCategory}
        />
      </div>
    </div>
  );
}

export default BusinessToolbar;
