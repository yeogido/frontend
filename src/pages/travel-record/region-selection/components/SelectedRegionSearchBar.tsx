import closeIcon from '../assets/material-symbols_close-rounded.svg';
import locationIcon from '../assets/material-symbols_location-on-rounded.svg';
import type { TravelRecordRegion } from '../types';

interface SelectedRegionSearchBarProps {
  region: TravelRecordRegion;
  onClear: () => void;
}

function SelectedRegionSearchBar({
  region,
  onClear,
}: SelectedRegionSearchBarProps) {
  return (
    <div
      className="border-main-5 bg-main-2 relative h-[47px] w-full overflow-hidden rounded-[12px] border"
      role="status"
      aria-label={`선택한 지역: ${region.selectionName}`}
    >
      <div className="absolute inset-x-[14px] top-[11px] flex h-6 items-center justify-between">
        <div className="flex min-w-0 items-center gap-[10px]">
          <img
            src={locationIcon}
            alt=""
            aria-hidden="true"
            className="size-6 shrink-0"
          />
          <span className="text-main-5 truncate text-[14px] leading-normal font-semibold">
            {region.selectionName}
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="ml-3 size-6 shrink-0 cursor-pointer"
          aria-label={`${region.selectionName} 선택 해제`}
        >
          <img
            src={closeIcon}
            alt=""
            aria-hidden="true"
            className="size-6"
          />
        </button>
      </div>
    </div>
  );
}

export default SelectedRegionSearchBar;
