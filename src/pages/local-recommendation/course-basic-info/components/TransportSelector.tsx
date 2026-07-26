import { FaCar, FaPersonWalking } from 'react-icons/fa6';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { scaleValue } from '../../../../utils/responsiveLayout';

import { transportOptions } from '../constants/options';
import type { CourseBasicInfoValues } from '../schema';

// Figma 390 디자인 기준 리터럴 px
const LEGEND_MARGIN_BOTTOM = 12;
const LEGEND_FONT_SIZE = 16;
const GRID_GAP = 16;
const CARD_MIN_HEIGHT = 100;
const CARD_PADDING_X = 12;
const CARD_PADDING_Y = 16;
const ICON_SIZE = 24;
const LABEL_MARGIN_TOP = 8;
const LABEL_FONT_SIZE = 14;
const DESCRIPTION_MARGIN_TOP = 4;
const DESCRIPTION_FONT_SIZE = 10;
const CARD_BORDER_RADIUS = 12;

interface TransportSelectorProps {
  value: CourseBasicInfoValues['transport'];
  onChange: (value: CourseBasicInfoValues['transport']) => void;
}

const icons = {
  walking: FaPersonWalking,
  car: FaCar,
};

function TransportSelector({ value, onChange }: TransportSelectorProps) {
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
        어떻게 이동하는 코스인가요?
      </legend>
      <div className="grid grid-cols-2" style={{ gap: GRID_GAP * scale }}>
        {transportOptions.map((option) => {
          const Icon = icons[option.value];
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-center justify-center border ${
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
                className="font-medium"
                style={{
                  marginTop: LABEL_MARGIN_TOP * scale,
                  fontSize: scaleValue(LABEL_FONT_SIZE, scale, 14),
                }}
              >
                {option.label}
              </span>
              <span
                style={{
                  marginTop: DESCRIPTION_MARGIN_TOP * scale,
                  fontSize: scaleValue(DESCRIPTION_FONT_SIZE, scale, 10),
                }}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default TransportSelector;
