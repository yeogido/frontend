import { IoClose, IoLocationOutline } from 'react-icons/io5';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { Neighborhood } from '../types';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 24;
const HEADING_MARGIN_BOTTOM = 12;
const HEADING_SIZE = 14;
const CARD_MIN_HEIGHT = 64;
const CARD_GAP = 12;
const CARD_RADIUS = 12;
const CARD_PADDING_X = 16;
const CARD_PADDING_Y = 12;
const ICON_SIZE = 20;
const DISTRICT_SIZE = 14;
const META_MARGIN_TOP = 2;
const META_SIZE = 12;

interface SelectedNeighborhoodCardProps {
  neighborhood: Neighborhood;
  onClear: () => void;
}

function SelectedNeighborhoodCard({
  neighborhood,
  onClear,
}: SelectedNeighborhoodCardProps) {
  const scale = useGlobalScale();

  return (
    <section
      aria-live="polite"
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
    >
      <h3
        className="font-semibold"
        style={{
          marginBottom: HEADING_MARGIN_BOTTOM * scale,
          fontSize: HEADING_SIZE * scale,
        }}
      >
        선택한 지역
      </h3>
      <button
        type="button"
        aria-label={`${neighborhood.name} 선택 해제`}
        onClick={onClear}
        className="border-main-5 bg-main-1 flex w-full items-center border text-left"
        style={{
          minHeight: CARD_MIN_HEIGHT * scale,
          gap: CARD_GAP * scale,
          borderRadius: CARD_RADIUS * scale,
          paddingLeft: CARD_PADDING_X * scale,
          paddingRight: CARD_PADDING_X * scale,
          paddingTop: CARD_PADDING_Y * scale,
          paddingBottom: CARD_PADDING_Y * scale,
        }}
      >
        <IoLocationOutline
          aria-hidden="true"
          className="text-main-5 shrink-0"
          style={{ fontSize: ICON_SIZE * scale }}
        />
        <span className="min-w-0 flex-1">
          <span
            className="block font-semibold"
            style={{ fontSize: DISTRICT_SIZE * scale }}
          >
            {neighborhood.name}
          </span>
          {neighborhood.parentName.trim() ? (
            <span
              className="text-gray-4 block"
              style={{
                marginTop: META_MARGIN_TOP * scale,
                fontSize: META_SIZE * scale,
              }}
            >
              {neighborhood.parentName}
            </span>
          ) : null}
        </span>
        <IoClose
          aria-hidden="true"
          className="text-main-5 shrink-0"
          style={{ fontSize: ICON_SIZE * scale }}
        />
      </button>
    </section>
  );
}

export default SelectedNeighborhoodCard;
