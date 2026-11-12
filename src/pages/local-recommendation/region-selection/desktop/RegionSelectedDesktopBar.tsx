import closeIcon from '../../../travel-record/region-selection/assets/material-symbols_close-rounded.svg';
import locationIcon from '../../../travel-record/region-selection/assets/material-symbols_location-on-rounded.svg';

interface RegionSelectedDesktopBarProps {
  name: string;
  onClear: () => void;
}

/** 지역을 고르면 검색창 자리에 나타나는 선택 표시줄 (Figma 6336:87616). */
function RegionSelectedDesktopBar({
  name,
  onClear,
}: RegionSelectedDesktopBarProps) {
  return (
    <div
      className="border-main-5 bg-main-2 flex h-[48px] w-full items-center justify-between rounded-[12px] border px-[16px]"
      role="status"
      aria-label={'선택한 지역: ' + name}
    >
      <div className="flex min-w-0 items-center gap-[10px]">
        <img
          src={locationIcon}
          alt=""
          aria-hidden="true"
          className="size-[24px] shrink-0"
        />
        <span className="text-main-5 truncate text-[16px] font-semibold">
          {name}
        </span>
      </div>

      <button
        type="button"
        onClick={onClear}
        aria-label={name + ' 선택 해제'}
        className="ml-[12px] size-[24px] shrink-0 cursor-pointer"
      >
        <img
          src={closeIcon}
          alt=""
          aria-hidden="true"
          className="size-[24px]"
        />
      </button>
    </div>
  );
}

export default RegionSelectedDesktopBar;
