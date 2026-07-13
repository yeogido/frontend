import type { UseFormRegisterReturn } from 'react-hook-form';
import { IoChevronDown } from 'react-icons/io5';

import { durationOptions } from '../constants/options';

interface DurationSelectProps {
  registration: UseFormRegisterReturn<'duration'>;
}

function DurationSelect({ registration }: DurationSelectProps) {
  return (
    <div className="relative">
      <select
        {...registration}
        id="course-duration"
        defaultValue=""
        className="border-gray-2 bg-pure-white focus:border-main-5 h-12 w-full appearance-none rounded-xl border px-4 pr-11 text-sm outline-none"
      >
        <option value="" disabled>
          여행 기간을 선택해 주세요.
        </option>
        {durationOptions.map((option) => (
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

export default DurationSelect;
