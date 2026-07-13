import type { UseFormRegisterReturn } from 'react-hook-form';
import { IoChevronDown } from 'react-icons/io5';

import { monthOptions } from '../constants/options';

interface VisitMonthRangeProps {
  startRegistration: UseFormRegisterReturn<'visitStartMonth'>;
  endRegistration: UseFormRegisterReturn<'visitEndMonth'>;
}

interface MonthSelectProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn<'visitStartMonth' | 'visitEndMonth'>;
}

function MonthSelect({ id, label, registration }: MonthSelectProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        {...registration}
        id={id}
        defaultValue=""
        className="border-gray-2 bg-pure-white focus:border-main-5 h-12 w-full appearance-none rounded-xl border px-4 pr-10 text-sm outline-none"
      >
        <option value="" disabled>
          선택
        </option>
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <IoChevronDown
        aria-hidden="true"
        className="text-gray-4 pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xl"
      />
    </div>
  );
}

function VisitMonthRange({
  startRegistration,
  endRegistration,
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
          registration={startRegistration}
        />
        <span aria-hidden="true" className="bg-gray-3 h-px w-6 shrink-0" />
        <MonthSelect
          id="visit-end-month"
          label="방문 종료 월"
          registration={endRegistration}
        />
      </div>
    </fieldset>
  );
}

export default VisitMonthRange;
