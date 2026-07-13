import {
  FaChildReaching,
  FaHeart,
  FaPeopleGroup,
  FaPeopleRoof,
  FaUser,
} from 'react-icons/fa6';

import { companionOptions } from '../constants/options';
import type { CourseBasicInfoValues } from '../schema';

interface CompanionSelectorProps {
  value: CourseBasicInfoValues['companion'];
  onChange: (value: CourseBasicInfoValues['companion']) => void;
}

const icons = {
  solo: FaUser,
  friends: FaPeopleGroup,
  couple: FaHeart,
  family: FaPeopleRoof,
  children: FaChildReaching,
};

function CompanionSelector({ value, onChange }: CompanionSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-semibold">
        누구와 함께 즐기기 좋은 코스인가요?
      </legend>
      <div className="grid grid-cols-5 gap-2">
        {companionOptions.map((option) => {
          const Icon = icons[option.value];
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2 ${
                selected
                  ? 'border-main-5 bg-main-2 text-main-5'
                  : 'border-gray-2 bg-pure-white text-gray-4'
              }`}
            >
              <Icon aria-hidden="true" className="text-lg" />
              <span className="mt-1 w-full truncate text-[10px]">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default CompanionSelector;
