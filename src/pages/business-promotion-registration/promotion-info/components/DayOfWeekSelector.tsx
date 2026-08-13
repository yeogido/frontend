import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import { dayOfWeekOptions } from '../constants/options';
import type { DayOfWeek } from '../schema';

// Figma 390 디자인 기준 리터럴 px
const SUB_LABEL_MARGIN_BOTTOM = 8;
const SUB_LABEL_FONT_SIZE = 14;
const GRID_GAP = 8;
const CARD_HEIGHT = 43;
const CARD_FONT_SIZE = 14;
const CARD_BORDER_RADIUS = 12;

interface DayOfWeekSelectorProps {
  value: DayOfWeek[];
  onChange: (value: DayOfWeek[]) => void;
}

function DayOfWeekSelector({ value, onChange }: DayOfWeekSelectorProps) {
  const scale = useGlobalScale();

  const toggleDay = (day: DayOfWeek) => {
    onChange(
      value.includes(day)
        ? value.filter((selected) => selected !== day)
        : [...value, day]
    );
  };

  return (
    <fieldset>
      <legend
        className="text-gray-5 font-medium"
        style={{
          marginBottom: SUB_LABEL_MARGIN_BOTTOM * scale,
          fontSize: SUB_LABEL_FONT_SIZE * scale,
        }}
      >
        요일
      </legend>
      <div className="grid grid-cols-7" style={{ gap: GRID_GAP * scale }}>
        {dayOfWeekOptions.map((option) => {
          const selected = value.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleDay(option.value)}
              className={`flex min-w-0 items-center justify-center border ${
                selected
                  ? 'border-main-5 bg-main-2 text-main-5'
                  : 'border-gray-2 text-gray-4 bg-white'
              }`}
              style={{
                height: CARD_HEIGHT * scale,
                fontSize: CARD_FONT_SIZE * scale,
                borderRadius: CARD_BORDER_RADIUS * scale,
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default DayOfWeekSelector;
