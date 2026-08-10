import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { TagDefinition } from '../../../../types/tag.type';

// Figma 390 디자인 기준 리터럴 px
const TAG_IMAGE_MAX_HEIGHT = 25;

interface TagChipProps {
  tag: TagDefinition;
  selected: boolean;
  onToggle: (tagId: TagDefinition['id']) => void;
}

function TagChip({ tag, selected, onToggle }: TagChipProps) {
  const scale = useGlobalScale();
  // 44px 터치 타깃은 접근성 때문에 유지하되, 아이콘(25px*scale)보다 큰
  // 만큼의 높이가 줄 사이 문서 흐름에도 그대로 잡혀 줄 간격이 Figma보다
  // 훨씬 넓어 보였다. 음수 마진으로 버튼이 차지하는 흐름상 높이만 아이콘
  // 높이로 줄이고, 실제 44px 터치 영역은 위아래로 넘치게 둔다.
  const verticalOverflow = Math.max(
    0,
    (MIN_TOUCH_TARGET - TAG_IMAGE_MAX_HEIGHT * scale) / 2
  );

  return (
    <button
      type="button"
      aria-label={`${tag.label} 키워드`}
      aria-pressed={selected}
      onClick={() => onToggle(tag.id)}
      className="focus-visible:outline-main-5 flex min-w-0 shrink items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        minWidth: MIN_TOUCH_TARGET,
        minHeight: MIN_TOUCH_TARGET,
        marginTop: -verticalOverflow,
        marginBottom: -verticalOverflow,
      }}
    >
      <img
        src={
          selected ? tag.assets.tagChip.selected : tag.assets.tagChip.inactive
        }
        alt=""
        aria-hidden="true"
        className="block h-auto w-auto max-w-full"
        style={{ maxHeight: TAG_IMAGE_MAX_HEIGHT * scale }}
      />
    </button>
  );
}

export default TagChip;
