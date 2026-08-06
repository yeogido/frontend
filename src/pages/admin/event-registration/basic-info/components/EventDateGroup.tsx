import { useState } from 'react';

import CustomSelect from '../../../../local-recommendation/course-basic-info/components/CustomSelect';
import { useGlobalScale } from '../../../../../hooks/useGlobalScale';
import { dayOptions, monthOptions, yearOptions } from '../constants/dateOptions';

// Figma 390 디자인 기준 리터럴 px
const LEGEND_MARGIN_BOTTOM = 8;
const LEGEND_FONT_SIZE = 14;
const ROW_GAP = 12;

interface EventDateGroupProps {
  id: string;
  legend: string;
  value: string;
  onChange: (value: string) => void;
}

function EventDateGroup({ id, legend, value, onChange }: EventDateGroupProps) {
  const scale = useGlobalScale();
  const [initialYear = '', initialMonth = '', initialDay = ''] = value
    ? value.split('-')
    : [];
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [day, setDay] = useState(initialDay);

  const applyChange = (
    nextYear: string,
    nextMonth: string,
    nextDay: string
  ) => {
    setYear(nextYear);
    setMonth(nextMonth);
    setDay(nextDay);
    onChange(
      nextYear && nextMonth && nextDay
        ? `${nextYear}-${nextMonth}-${nextDay}`
        : ''
    );
  };

  return (
    <fieldset>
      <legend
        className="text-gray-5 font-medium"
        style={{
          marginBottom: LEGEND_MARGIN_BOTTOM * scale,
          fontSize: LEGEND_FONT_SIZE * scale,
        }}
      >
        {legend}
      </legend>
      <div className="flex items-center" style={{ gap: ROW_GAP * scale }}>
        <CustomSelect
          id={`${id}-year`}
          options={yearOptions}
          placeholder="연도"
          value={year || undefined}
          onChange={(nextYear) => applyChange(nextYear, month, day)}
        />
        <CustomSelect
          id={`${id}-month`}
          options={monthOptions}
          placeholder="월"
          value={month || undefined}
          onChange={(nextMonth) => applyChange(year, nextMonth, day)}
        />
        <CustomSelect
          id={`${id}-day`}
          options={dayOptions}
          placeholder="일"
          value={day || undefined}
          onChange={(nextDay) => applyChange(year, month, nextDay)}
        />
      </div>
    </fieldset>
  );
}

export default EventDateGroup;
