import { IoTimeOutline } from 'react-icons/io5';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { Neighborhood } from '../types';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 32;
const HEADING_SIZE = 16;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 8;
const LIST_PADDING_BOTTOM = 4;
const CHIP_HEIGHT = 40;
const CHIP_GAP = 6;
const CHIP_PADDING_X = 14;
const CHIP_TEXT_SIZE = 14;
const CHIP_ICON_SIZE = 14;

interface RecentSearchSectionProps {
  neighborhoods: Neighborhood[];
  onSelect: (neighborhood: Neighborhood) => void;
}

function RecentSearchSection({
  neighborhoods,
  onSelect,
}: RecentSearchSectionProps) {
  const scale = useGlobalScale();

  if (neighborhoods.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="recent-search-heading"
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
    >
      <h3
        id="recent-search-heading"
        className="font-bold"
        style={{ fontSize: HEADING_SIZE * scale }}
      >
        최근 검색
      </h3>
      <div
        className="flex overflow-x-auto"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          gap: LIST_GAP * scale,
          paddingBottom: LIST_PADDING_BOTTOM * scale,
        }}
      >
        {neighborhoods.map((neighborhood) => (
          <button
            key={neighborhood.id}
            type="button"
            onClick={() => onSelect(neighborhood)}
            className="flex shrink-0 items-center justify-center"
            style={{
              minHeight: MIN_TOUCH_TARGET,
            }}
          >
            <span
              className="border-gray-2 bg-pure-white flex items-center rounded-full border font-medium"
              style={{
                height: CHIP_HEIGHT * scale,
                gap: CHIP_GAP * scale,
                paddingLeft: CHIP_PADDING_X * scale,
                paddingRight: CHIP_PADDING_X * scale,
                fontSize: CHIP_TEXT_SIZE * scale,
              }}
            >
              <IoTimeOutline
                aria-hidden="true"
                className="text-gray-4"
                style={{ fontSize: CHIP_ICON_SIZE * scale }}
              />
              {neighborhood.city} {neighborhood.district}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default RecentSearchSection;
