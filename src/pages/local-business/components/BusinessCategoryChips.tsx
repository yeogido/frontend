import type { BusinessCategory } from '../types';

interface BusinessCategoryChipsProps {
  categories: readonly BusinessCategory[];
  selectedCategory: BusinessCategory;
  onSelectCategory: (category: BusinessCategory) => void;
}

function BusinessCategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
}: BusinessCategoryChipsProps) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      {categories.map((category) => {
        const isSelected = category === selectedCategory;

        return (
          <button
            key={category}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(category)}
            className={`h-[29px] rounded-full border px-3 py-1.5 text-[14px] leading-none font-normal whitespace-nowrap cursor-pointer ${
              isSelected
                ? 'border-[#FF6F41] bg-[#FFEBE5] text-[#FF6F41]'
                : 'border-gray-2 bg-pure-white text-gray-4'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export default BusinessCategoryChips;
