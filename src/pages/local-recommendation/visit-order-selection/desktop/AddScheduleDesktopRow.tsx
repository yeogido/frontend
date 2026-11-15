import { getCourseDayOrdinal } from '../../../../utils/courseDetail';

// Figma 1440 데스크톱 시안의 일정 카드와 같은 치수를 쓴다.
const BADGE_SIZE = 28;
const ICON_SIZE = 18;
const ROW_GAP = 24;

interface AddScheduleDesktopRowProps {
  /** 1부터 세는 일차 — 안내 문구를 '첫째날의…'처럼 부르는 데 쓴다. */
  day: number;
  onClick: () => void;
}

/**
 * 편집 모드에서 각 일차 목록 끝에 붙는 일정 추가 줄.
 * 데스크톱 시안에는 편집 모드 프레임이 없어, 모바일과 같은 동작을
 * 데스크톱 치수로 옮겼다.
 */
function AddScheduleDesktopRow({ day, onClick }: AddScheduleDesktopRowProps) {
  const title = getCourseDayOrdinal(day) + '의 일정을 추가해보세요';

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center text-left"
        style={{ gap: ROW_GAP }}
      >
        <span
          className="bg-main-5 flex shrink-0 items-center justify-center rounded-full text-white"
          style={{ height: BADGE_SIZE, width: BADGE_SIZE }}
        >
          <svg
            viewBox="0 0 18 18"
            aria-hidden="true"
            className="fill-none stroke-current stroke-[2]"
            style={{ height: ICON_SIZE, width: ICON_SIZE }}
          >
            <path d="M9 4v10M4 9h10" strokeLinecap="round" />
          </svg>
        </span>
        <span className="bg-background flex min-w-0 flex-1 flex-col gap-[8px] rounded-[12px] p-[12px]">
          <span className="truncate text-[20px] font-semibold text-black">
            {title}
          </span>
          <span className="text-gray-5 truncate text-[16px]">
            새로운 장소나 행사를 추가해보세요
          </span>
        </span>
      </button>
    </li>
  );
}

export default AddScheduleDesktopRow;
