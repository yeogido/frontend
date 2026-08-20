import shareIcon from '../../../assets/icons/share.svg';
import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const BUTTON_SIZE = 32;
const ICON_SIZE = 16;

export interface ShareButtonProps {
  onClick: () => void;
  /** 접근성 이름. 미전달 시 코스 상세 기준 문구를 유지한다. */
  label?: string;
}

export function ShareButton({
  onClick,
  label = '코스 공유하기',
}: ShareButtonProps) {
  const scale = useGlobalScale();
  const visualSize = BUTTON_SIZE * scale;
  // 버튼 자체는 44 미만이라 최소 탭 영역(44)을 채워야 하는데, width/height를
  // 그대로 44로 키우면 디자인상 32px 자리인 버튼이 실제로 더 넓은 공간을
  // 차지해 옆 요소(제목)와의 간격이 Figma보다 벌어져 보였다. 탭 영역은
  // 44까지 키우돼, 늘어난 만큼을 음수 마진으로 상쇄해 레이아웃에서 차지하는
  // 자리는 그대로 32px로 유지한다.
  const tapSize = Math.max(MIN_TOUCH_TARGET, visualSize);
  const inset = (tapSize - visualSize) / 2;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center bg-white text-[#1C1C1C]"
      style={{
        height: tapSize,
        width: tapSize,
        marginTop: -inset,
        marginBottom: -inset,
        marginLeft: -inset,
        marginRight: -inset,
      }}
    >
      <img
        src={shareIcon}
        alt=""
        aria-hidden="true"
        style={{ height: ICON_SIZE * scale, width: ICON_SIZE * scale }}
      />
    </button>
  );
}

export const DetailShareButton = ShareButton;
export default ShareButton;
