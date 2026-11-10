import { useGlobalScale } from '../../../hooks/useGlobalScale';

// 모든 수치는 Figma 390 디자인 기준 px
const TITLE_SIZE = 14;
const TITLE_LINE_HEIGHT = 17;
const CHIP_LIST_MARGIN_TOP = 12;
const CHIP_GAP = 8;
const CHIP_HEIGHT = 26;
const CHIP_PADDING_LEFT = 12;
const CHIP_PADDING_RIGHT = 8;
const CHIP_TEXT_SIZE = 12;
const CHEVRON_SIZE = 12;

interface SearchConditionChipsProps {
  conditions: readonly string[];
  onSelect: (condition: string) => void;
}

/** 자연어 검색 결과 하단 — 서버가 문장에서 뽑은 조건 하나로 다시 검색한다. */
function SearchConditionChips({
  conditions,
  onSelect,
}: SearchConditionChipsProps) {
  const scale = useGlobalScale();

  if (conditions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="search-condition-chips-title">
      <h2
        id="search-condition-chips-title"
        className="font-semibold text-[#1C1C1C]"
        style={{
          fontSize: TITLE_SIZE * scale,
          lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
        }}
      >
        원하는 조건으로 더 많은 코스를 찾아보세요
      </h2>

      <ul
        className="flex flex-wrap"
        style={{
          marginTop: CHIP_LIST_MARGIN_TOP * scale,
          gap: CHIP_GAP * scale,
        }}
      >
        {conditions.map((condition) => (
          <li key={condition}>
            <button
              type="button"
              aria-label={`${condition} 조건으로 다시 검색`}
              onClick={() => onSelect(condition)}
              className="border-main-5 bg-main-1 text-main-5 flex items-center rounded-full border font-medium"
              style={{
                height: CHIP_HEIGHT * scale,
                paddingLeft: CHIP_PADDING_LEFT * scale,
                paddingRight: CHIP_PADDING_RIGHT * scale,
                gap: 2 * scale,
                fontSize: CHIP_TEXT_SIZE * scale,
              }}
            >
              {condition}
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  width: CHEVRON_SIZE * scale,
                  height: CHEVRON_SIZE * scale,
                }}
              >
                <path
                  d="M4.5 2.5 8 6l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SearchConditionChips;
