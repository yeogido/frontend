import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import { timeOptions } from '../constants/options';
import CustomSelect from './CustomSelect';

// Figma 390 디자인 기준 리터럴 px
const SUB_LABEL_MARGIN_BOTTOM = 8;
const SUB_LABEL_FONT_SIZE = 14;
const ROW_GAP = 16;
const DIVIDER_WIDTH = 24;
const DIVIDER_HEIGHT = 1;

interface TimeRangeProps {
  legend: string;
  idPrefix: string;
  startValue?: string;
  endValue?: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

interface TimeSelectProps {
  id: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

function TimeSelect({ id, label, value, onChange }: TimeSelectProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <CustomSelect
        id={id}
        options={timeOptions}
        placeholder="선택"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function TimeRange({
  legend,
  idPrefix,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
}: TimeRangeProps) {
  const scale = useGlobalScale();

  return (
    <fieldset>
      <legend
        className="text-gray-5 font-medium"
        style={{
          marginBottom: SUB_LABEL_MARGIN_BOTTOM * scale,
          fontSize: SUB_LABEL_FONT_SIZE * scale,
        }}
      >
        {legend}
      </legend>
      <div className="flex items-center" style={{ gap: ROW_GAP * scale }}>
        <TimeSelect
          id={`${idPrefix}-open-time`}
          label="오픈 시간"
          value={startValue}
          onChange={onStartChange}
        />
        <span
          aria-hidden="true"
          className="bg-gray-3 shrink-0"
          style={{
            width: DIVIDER_WIDTH * scale,
            height: DIVIDER_HEIGHT * scale,
          }}
        />
        <TimeSelect
          id={`${idPrefix}-close-time`}
          label="마감 시간"
          value={endValue}
          onChange={onEndChange}
        />
      </div>
    </fieldset>
  );
}

export default TimeRange;
