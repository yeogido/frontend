import { useGlobalScale } from '../../../hooks/useGlobalScale';

import { businessCategories } from '../constants';
import type { BusinessCategory, BusinessSort, BusinessViewMode } from '../types';
import BusinessCategoryChips from './BusinessCategoryChips';
import BusinessSortDropdown from './BusinessSortDropdown';
import BusinessViewToggle from './BusinessViewToggle';

const TOOLBAR_MARGIN_TOP = 12;
const TOOLBAR_HEIGHT = 29;
const TOOLBAR_GAP = 8;

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
  const scale = useGlobalScale();

  return (
    <div
      className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{
        marginTop: TOOLBAR_MARGIN_TOP * scale,
        height: TOOLBAR_HEIGHT * scale,
      }}
    >
      <div
        className="flex w-max items-center"
        style={{
          gap: TOOLBAR_GAP,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
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
