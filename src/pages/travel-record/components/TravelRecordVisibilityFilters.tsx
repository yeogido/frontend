import type { TravelRecordVisibilityFilter } from '../types';

const visibilityOptions = [
  { value: 'all', label: '전체' },
  { value: 'public', label: '전체 공개' },
  { value: 'friends', label: '친구 공개' },
  { value: 'private', label: '나만보기' },
] as const;

interface TravelRecordVisibilityFiltersProps {
  value: TravelRecordVisibilityFilter;
  onChange: (value: TravelRecordVisibilityFilter) => void;
}

function TravelRecordVisibilityFilters({
  value,
  onChange,
}: TravelRecordVisibilityFiltersProps) {
  return (
    <div
      role="group"
      aria-label="여행 폴더 공개범위"
      className="scrollbar-hide -mr-6 flex min-w-0 flex-1 gap-2 overflow-x-auto pr-6"
    >
      {visibilityOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm leading-[17px] whitespace-nowrap ${value === option.value ? 'border-main-5 bg-main-2 text-main-5' : 'border-gray-2 text-gray-4 bg-white'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default TravelRecordVisibilityFilters;
