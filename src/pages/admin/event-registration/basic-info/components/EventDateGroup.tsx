import { useState } from 'react';

import CustomSelect from '../../../../local-recommendation/course-basic-info/components/CustomSelect';
import { useGlobalScale } from '../../../../../hooks/useGlobalScale';
import {
  getDayOptions,
  getDaysInMonth,
  monthOptions,
  yearOptions,
} from '../constants/dateOptions';

// Figma 390 디자인 기준 리터럴 px
const LEGEND_MARGIN_BOTTOM = 8;
const LEGEND_FONT_SIZE = 14;
const ROW_GAP = 12;

interface EventDateGroupProps {
  id: string;
  legend: string;
  value: string;
  onChange: (value: string) => void;
  desktop?: boolean;
}

function EventDateGroup({
  id,
  legend,
  value,
  onChange,
  desktop = false,
}: EventDateGroupProps) {
  const scale = useGlobalScale();
  const [initialYear = '', initialMonth = '', initialDay = ''] = value
    ? value.split('-')
    : [];
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [day, setDay] = useState(initialDay);
  const dayOptions = getDayOptions(year, month);

  const applyChange = (
    nextYear: string,
    nextMonth: string,
    nextDay: string
  ) => {
    // 월이 바뀌어 기존에 고른 일자가 더 이상 유효하지 않으면(예: 31일 -> 2월) 초기화한다.
    const maxDay = getDaysInMonth(nextYear, nextMonth);
    const clampedDay = nextDay && Number(nextDay) > maxDay ? '' : nextDay;

    setYear(nextYear);
    setMonth(nextMonth);
    setDay(clampedDay);
    onChange(
      nextYear && nextMonth && clampedDay
        ? `${nextYear}-${nextMonth}-${clampedDay}`
        : ''
    );
  };

  if (desktop) {
    const selections = [
      {
        name: '연도',
        value: year,
        options: yearOptions,
        change: (v: string) => applyChange(v, month, day),
      },
      {
        name: '월',
        value: month,
        options: monthOptions,
        change: (v: string) => applyChange(year, v, day),
      },
      {
        name: '일',
        value: day,
        options: dayOptions,
        change: (v: string) => applyChange(year, month, v),
      },
    ];
    return (
      <fieldset>
        <legend className="text-gray-5 mb-[6px] text-[16px]">{legend}</legend>
        <div className="flex gap-[20px]">
          {selections.map((selection) => (
            <select
              key={selection.name}
              aria-label={`${legend} ${selection.name}`}
              value={selection.value}
              onChange={(event) => selection.change(event.target.value)}
              className="border-gray-2 text-gray-5 min-w-0 flex-1 rounded-[12px] border bg-white p-[20px] text-[16px]"
            >
              <option value="">{selection.name}</option>
              {selection.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      </fieldset>
    );
  }

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
