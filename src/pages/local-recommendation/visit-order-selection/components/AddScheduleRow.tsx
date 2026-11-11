import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { getCourseDayOrdinal } from '../../../../utils/courseDetail';

// Figma 390 디자인 기준 리터럴 px (코스 수정 5998:28963)
const BADGE_SIZE = 28;
const ICON_SIZE = 18;
const ROW_GAP = 12;
const CARD_HEIGHT = 72;
const CARD_PADDING_X = 20;
const CARD_RADIUS = 12;
const TITLE_SIZE = 14;
const DESCRIPTION_MARGIN_TOP = 8;
const DESCRIPTION_SIZE = 12;

interface AddScheduleRowProps {
  /** 1부터 세는 일차 — 안내 문구를 '첫째날의…'처럼 부르는 데 쓴다. */
  day: number;
  onClick: () => void;
}

/** 편집 모드에서 각 일차 목록 끝에 붙는 일정 추가 줄. */
function AddScheduleRow({ day, onClick }: AddScheduleRowProps) {
  const scale = useGlobalScale();
  const title = `${getCourseDayOrdinal(day)}의 일정을 추가해보세요`;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center text-left"
        style={{ gap: ROW_GAP * scale }}
      >
        <span
          className="bg-main-5 flex shrink-0 items-center justify-center rounded-full text-white"
          style={{
            height: BADGE_SIZE * scale,
            width: BADGE_SIZE * scale,
          }}
        >
          <svg
            viewBox="0 0 18 18"
            aria-hidden="true"
            className="fill-none stroke-current stroke-[2]"
            style={{ height: ICON_SIZE * scale, width: ICON_SIZE * scale }}
          >
            <path d="M9 4v10M4 9h10" strokeLinecap="round" />
          </svg>
        </span>
        <span
          className="bg-background flex min-w-0 flex-1 flex-col justify-center"
          style={{
            height: CARD_HEIGHT * scale,
            paddingLeft: CARD_PADDING_X * scale,
            paddingRight: CARD_PADDING_X * scale,
            borderRadius: CARD_RADIUS * scale,
          }}
        >
          <span
            className="truncate font-semibold text-black"
            style={{ fontSize: Math.max(TITLE_SIZE * scale, 12) }}
          >
            {title}
          </span>
          <span
            className="text-gray-5 truncate"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: Math.max(DESCRIPTION_SIZE * scale, 11),
            }}
          >
            새로운 장소나 행사를 추가해보세요
          </span>
        </span>
      </button>
    </li>
  );
}

export default AddScheduleRow;
