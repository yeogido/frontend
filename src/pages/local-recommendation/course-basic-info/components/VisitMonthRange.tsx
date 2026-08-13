import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import { monthOptions } from '../constants/options';
import type { CourseBasicInfoValues } from '../schema';
import CustomSelect from './CustomSelect';

// Figma 390 디자인 기준 리터럴 px
const LEGEND_MARGIN_BOTTOM = 12;
const LEGEND_FONT_SIZE = 16;
const ROW_GAP = 16;
const DIVIDER_WIDTH = 24;
const DIVIDER_HEIGHT = 1;

type Month = CourseBasicInfoValues['visitStartMonth'];

interface VisitMonthRangeProps {
  startValue?: Month;
  endValue?: Month;
  onStartChange: (value: Month) => void;
  onEndChange: (value: Month) => void;
}

interface MonthSelectProps {
  id: string;
  label: string;
  value?: Month;
  onChange: (value: Month) => void;
}

function MonthSelect({ id, label, value, onChange }: MonthSelectProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <CustomSelect
        id={id}
        options={monthOptions}
        placeholder="선택"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function VisitMonthRange({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
}: VisitMonthRangeProps) {
  const scale = useGlobalScale();

  return (
    <fieldset>
      <legend
        className="font-semibold"
        style={{
          marginBottom: LEGEND_MARGIN_BOTTOM * scale,
          fontSize: LEGEND_FONT_SIZE * scale,
        }}
      >
        언제 방문하기 좋은 코스인가요?
      </legend>
      <div className="flex items-center" style={{ gap: ROW_GAP * scale }}>
        <MonthSelect
          id="visit-start-month"
          label="방문 시작 월"
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
        <MonthSelect
          id="visit-end-month"
          label="방문 종료 월"
          value={endValue}
          onChange={onEndChange}
        />
      </div>
    </fieldset>
  );
}

export default VisitMonthRange;
