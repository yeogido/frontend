import { SearchBar } from '../../../../components/common';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const TITLE_SIZE = 22;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;
const SEARCH_MARGIN_TOP = 28;

interface NeighborhoodSearchSectionProps {
  suggestions?: readonly string[];
  onSearch: (query: string) => void;
  onQueryChange?: (query: string) => void;
}

function NeighborhoodSearchSection({
  suggestions = [],
  onSearch,
  onQueryChange,
}: NeighborhoodSearchSectionProps) {
  const scale = useGlobalScale();

  return (
    <section aria-labelledby="neighborhood-heading">
      <h2
        id="neighborhood-heading"
        className="leading-[1.35] font-bold"
        style={{ fontSize: TITLE_SIZE * scale }}
      >
        어디를
        <br />
        추천하시나요?
      </h2>
      <p
        className="text-gray-4"
        style={{
          marginTop: DESCRIPTION_MARGIN_TOP * scale,
          fontSize: DESCRIPTION_SIZE * scale,
          lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
        }}
      >
        코스를 등록할 지역을 검색하거나 선택해주세요.
      </p>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchBar
          className="!max-w-none"
          placeholder="지역명을 검색해 주세요"
          label="추천 지역 검색"
          suggestions={suggestions}
          onSearch={onSearch}
          onQueryChange={onQueryChange}
        />
      </div>
    </section>
  );
}

export default NeighborhoodSearchSection;
