import { IoClose, IoLocationOutline } from 'react-icons/io5';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { scaleValue } from '../../../../utils/responsiveLayout';
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
          fontSize: scaleValue(HEADING_SIZE, scale, 14),
        }}
      >
        선택한 지역
      </h3>
      <button
        type="button"
        aria-label={`${neighborhood.district} 선택 해제`}
        onClick={onClear}
        className="border-main-5 bg-main-1 flex w-full items-center border text-left"
        style={{
          minHeight: scaleValue(CARD_MIN_HEIGHT, scale, MIN_TOUCH_TARGET),
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
            style={{ fontSize: scaleValue(DISTRICT_SIZE, scale, 14) }}
          >
            {neighborhood.district}
          </span>
          <span
            className="text-gray-4 block"
            style={{
              marginTop: META_MARGIN_TOP * scale,
              fontSize: scaleValue(META_SIZE, scale, 12),
            }}
          >
            {neighborhood.province} {neighborhood.city}
          </span>
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
