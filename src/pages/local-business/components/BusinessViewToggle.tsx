import cardViewFilterChip from '../../../assets/category-tag-chip/cardview.svg';
import gridViewFilterChip from '../../../assets/category-tag-chip/gridview.svg';

import type { BusinessViewMode } from '../types';

interface BusinessViewToggleProps {
  mode: BusinessViewMode;
  onToggle: () => void;
}

function BusinessViewToggle({ mode, onToggle }: BusinessViewToggleProps) {
  const isGridMode = mode === 'grid';

  return (
    <button
      type="button"
      aria-label={isGridMode ? '그리드 보기로 전환' : '카드 보기로 전환'}
      onClick={onToggle}
      className="border-gray-2 bg-pure-white text-gray-4 flex h-[29px] min-w-[102px] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[14px] leading-none font-normal whitespace-nowrap cursor-pointer"
    >
      {isGridMode ? <CardViewIcon /> : <GridViewIcon />}
      <span className="text-[14px] leading-none">
        {isGridMode ? '카드 보기' : '그리드 보기'}
      </span>
    </button>
  );
}

function GridViewIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative block size-3.5 shrink-0 overflow-hidden"
    >
      <img
        src={gridViewFilterChip}
        alt=""
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-[29px] w-[96px] max-w-none -translate-x-[12px] -translate-y-1/2"
      />
    </span>
  );
}

function CardViewIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative block size-3.5 shrink-0 overflow-hidden"
    >
      <img
        src={cardViewFilterChip}
        alt=""
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-[29px] w-[96px] max-w-none -translate-x-[12px] -translate-y-1/2"
      />
    </span>
  );
}

export default BusinessViewToggle;
