import {
  FaChildReaching,
  FaHeart,
  FaPeopleGroup,
  FaPeopleRoof,
  FaUser,
} from 'react-icons/fa6';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { scaleValue } from '../../../../utils/responsiveLayout';

import { companionOptions } from '../constants/options';
import type { CourseBasicInfoValues } from '../schema';

// Figma 390 디자인 기준 리터럴 px
const LEGEND_MARGIN_BOTTOM = 12;
const LEGEND_FONT_SIZE = 16;
const GRID_GAP = 8;
const CARD_MIN_HEIGHT = 56;
const CARD_PADDING_X = 4;
const CARD_PADDING_Y = 8;
const ICON_SIZE = 18;
const LABEL_MARGIN_TOP = 4;
const LABEL_FONT_SIZE = 10;
const CARD_BORDER_RADIUS = 12;

interface CompanionSelectorProps {
  value: CourseBasicInfoValues['companion'];
  onChange: (value: CourseBasicInfoValues['companion']) => void;
}

const icons = {
  solo: FaUser,
  friends: FaPeopleGroup,
  couple: FaHeart,
  family: FaPeopleRoof,
  children: FaChildReaching,
};

function CompanionSelector({ value, onChange }: CompanionSelectorProps) {
  const scale = useGlobalScale();

  return (
    <fieldset>
      <legend
        className="font-semibold"
        style={{
          marginBottom: LEGEND_MARGIN_BOTTOM * scale,
          fontSize: scaleValue(LEGEND_FONT_SIZE, scale, 12),
        }}
      >
        누구와 함께 즐기기 좋은 코스인가요?
      </legend>
      <div className="grid grid-cols-5" style={{ gap: GRID_GAP * scale }}>
        {companionOptions.map((option) => {
          const Icon = icons[option.value];
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`flex min-w-0 flex-col items-center justify-center border ${
                selected
                  ? 'border-main-5 bg-main-2 text-main-5'
                  : 'border-gray-2 text-gray-4 bg-white'
              }`}
              style={{
                minHeight: scaleValue(CARD_MIN_HEIGHT, scale, MIN_TOUCH_TARGET),
                paddingLeft: CARD_PADDING_X * scale,
                paddingRight: CARD_PADDING_X * scale,
                paddingTop: CARD_PADDING_Y * scale,
                paddingBottom: CARD_PADDING_Y * scale,
                borderRadius: CARD_BORDER_RADIUS * scale,
              }}
            >
              <Icon
                aria-hidden="true"
                style={{ fontSize: ICON_SIZE * scale }}
              />
              <span
                className="w-full truncate"
                style={{
                  marginTop: LABEL_MARGIN_TOP * scale,
                  fontSize: scaleValue(LABEL_FONT_SIZE, scale, 10),
                }}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default CompanionSelector;
