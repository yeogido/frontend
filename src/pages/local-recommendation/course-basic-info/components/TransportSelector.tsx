import { FaCar, FaPersonWalking } from 'react-icons/fa6';

import { transportOptions } from '../constants/options';
import type { CourseBasicInfoValues } from '../schema';

interface TransportSelectorProps {
  value: CourseBasicInfoValues['transport'];
  onChange: (value: CourseBasicInfoValues['transport']) => void;
}

const icons = {
  walking: FaPersonWalking,
  car: FaCar,
};

function TransportSelector({ value, onChange }: TransportSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-semibold">
        어떻게 이동하는 코스인가요?
      </legend>
      <div className="grid grid-cols-2 gap-4">
        {transportOptions.map((option) => {
          const Icon = icons[option.value];
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`flex min-h-25 flex-col items-center justify-center rounded-xl border px-3 py-4 ${
                selected
                  ? 'border-main-5 bg-main-2 text-main-5'
                  : 'border-gray-2 text-gray-4 bg-white'
              }`}
            >
              <Icon aria-hidden="true" className="text-2xl" />
              <span className="mt-2 text-sm font-medium">{option.label}</span>
              <span className="mt-1 text-[10px]">{option.description}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default TransportSelector;
