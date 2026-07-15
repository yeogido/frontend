import { monthOptions } from '../constants/options';
import type { CourseBasicInfoValues } from '../schema';
import CustomSelect from './CustomSelect';

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
  return (
    <fieldset>
      <legend className="mb-3 text-base font-semibold">
        언제 방문하기 좋은 코스인가요?
      </legend>
      <div className="flex items-center gap-4 min-[375px]:gap-5">
        <MonthSelect
          id="visit-start-month"
          label="방문 시작 월"
          value={startValue}
          onChange={onStartChange}
        />
        <span aria-hidden="true" className="bg-gray-3 h-px w-6 shrink-0" />
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
