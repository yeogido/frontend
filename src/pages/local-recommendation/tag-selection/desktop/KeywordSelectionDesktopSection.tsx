import { tagDefinitions } from '../../../../constants/tags';
import type { TagId } from '../types';

// Figma 1440 데스크톱 시안(6360:38570) 기준 리터럴 px
const CHIP_HEIGHT = 34;
const CHIPS_MAX_WIDTH = 614;

interface KeywordSelectionDesktopSectionProps {
  selectedTagIds: ReadonlySet<TagId>;
  limitMessage: string;
  onToggle: (tagId: TagId) => void;
}

/**
 * 데스크톱 키워드 선택. 칩은 모바일과 같은 SVG 자산을 쓰고(선택 색까지
 * 자산에 들어 있다) 배치만 시안대로 614px 안에서 줄바꿈한다.
 *
 * 모바일 TagChip의 44px 터치 타깃 보정은 쓰지 않는다 — 포인터 입력에서는
 * 필요 없고, 음수 마진이 줄 간격까지 먹어 시안의 16px 간격이 무너진다.
 */
function KeywordSelectionDesktopSection({
  selectedTagIds,
  limitMessage,
  onToggle,
}: KeywordSelectionDesktopSectionProps) {
  return (
    <section
      className="flex w-full flex-col items-center gap-[20px]"
      aria-labelledby="keyword-title"
    >
      <div className="flex w-full items-center gap-[4px]">
        <h2 id="keyword-title" className="text-[20px] font-semibold text-black">
          키워드 등록
        </h2>
        <span className="text-gray-4 text-[16px]">(최대 5개)</span>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-[16px]"
        style={{ maxWidth: CHIPS_MAX_WIDTH }}
      >
        {tagDefinitions.map((tag) => {
          const selected = selectedTagIds.has(tag.id);

          return (
            <button
              key={tag.id}
              type="button"
              aria-label={tag.label + ' 키워드'}
              aria-pressed={selected}
              onClick={() => onToggle(tag.id)}
              className="focus-visible:outline-main-5 flex shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <img
                src={
                  selected
                    ? tag.assets.tagChip.selected
                    : tag.assets.tagChip.inactive
                }
                alt=""
                aria-hidden="true"
                className="block w-auto"
                style={{ height: CHIP_HEIGHT }}
              />
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {limitMessage}
      </p>
    </section>
  );
}

export default KeywordSelectionDesktopSection;
