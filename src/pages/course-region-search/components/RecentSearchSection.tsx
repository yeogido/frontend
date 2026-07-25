import closeRounded from '../../../assets/icons/close-rounded.svg';
import { useScaleFrame } from '../../../hooks/useScaleFrame';

const SECTION_DESIGN_WIDTH = 342;
const SECTION_MARGIN_TOP = 24;
const TITLE_SIZE = 16;
const TITLE_LINE_HEIGHT = 19;
const CLEAR_TOP = 3;
const CLEAR_SIZE = 12;
const CLEAR_LINE_HEIGHT = 14;
const CHIP_MARGIN_TOP = 12;
const CHIP_HEIGHT = 32;
const CHIP_GAP = 8;
const CHIP_MIN_WIDTH = 65;
const CHIP_INNER_GAP = 4;
const CHIP_PADDING_TOP_BOTTOM = 8;
const CHIP_PADDING_RIGHT = 10;
const CHIP_PADDING_LEFT = 14;
const CHIP_TEXT_SIZE = 12;
const CLOSE_SIZE = 16;

interface RecentSearchSectionProps {
  searches: readonly string[];
  onClear: () => void;
  onRemove: (index: number) => void;
  onSelect: (keyword: string) => void;
}

function RecentSearchSection({
  searches,
  onClear,
  onRemove,
  onSelect,
}: RecentSearchSectionProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(SECTION_DESIGN_WIDTH);
  const hasSearches = searches.length > 0;

  return (
    <section
      ref={outerRef}
      aria-label="최근 검색"
      className="overflow-visible"
      style={{
        marginTop: SECTION_MARGIN_TOP * scale,
        height: scaledHeight,
      }}
    >
      <div
        ref={innerRef}
        className="flex flex-col"
        style={{
          width: SECTION_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="flex items-start justify-between">
          <h2
            className="font-semibold text-black"
            style={{
              fontSize: TITLE_SIZE,
              lineHeight: `${TITLE_LINE_HEIGHT}px`,
            }}
          >
            최근 검색
          </h2>
          <button
            type="button"
            onClick={onClear}
            disabled={!hasSearches}
            aria-hidden={!hasSearches}
            className={`text-gray-4 font-normal ${
              hasSearches ? '' : 'invisible'
            }`}
            style={{
              paddingTop: CLEAR_TOP,
              fontSize: CLEAR_SIZE,
              lineHeight: `${CLEAR_LINE_HEIGHT}px`,
            }}
          >
            전체 삭제
          </button>
        </div>

        <div
          className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            marginTop: CHIP_MARGIN_TOP,
            height: CHIP_HEIGHT,
            gap: CHIP_GAP,
          }}
        >
          {searches.map((search, index) => (
            <div
              key={`${search}-${index}`}
              className="border-gray-2 bg-pure-white text-gray-4 flex shrink-0 items-center rounded-full border font-medium"
              style={{
                minWidth: CHIP_MIN_WIDTH,
                height: CHIP_HEIGHT,
                gap: CHIP_INNER_GAP,
                paddingTop: CHIP_PADDING_TOP_BOTTOM,
                paddingRight: CHIP_PADDING_RIGHT,
                paddingBottom: CHIP_PADDING_TOP_BOTTOM,
                paddingLeft: CHIP_PADDING_LEFT,
                fontSize: CHIP_TEXT_SIZE,
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(search)}
                className="text-gray-4 min-w-0 font-medium"
                style={{ fontSize: CHIP_TEXT_SIZE }}
              >
                {search}
              </button>

              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`${search} 최근 검색어 삭제`}
                className="shrink-0"
                style={{ width: CLOSE_SIZE, height: CLOSE_SIZE }}
              >
                <img src={closeRounded} alt="" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecentSearchSection;
