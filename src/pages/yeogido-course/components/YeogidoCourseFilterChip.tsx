import { useId } from 'react';
import { IoChevronDown } from 'react-icons/io5';

interface YeogidoCourseFilterChipProps {
  label: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (option: string) => void;
}

function YeogidoCourseFilterChip({
  label,
  options,
  isOpen,
  onToggle,
  onSelect,
}: YeogidoCourseFilterChipProps) {
  const buttonId = useId();
  const listboxId = useId();

  return (
    <div className="relative">
      <button
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={onToggle}
        className="border-gray-2 bg-pure-white text-gray-4 flex h-[29px] min-w-[73px] items-center justify-between gap-1 rounded-full border px-2.5 py-1.5 text-[14px] leading-none font-normal whitespace-nowrap"
      >
        <span>{label}</span>
        <IoChevronDown
          aria-hidden="true"
          className={`shrink-0 text-[12px] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute top-[33px] left-0 z-20 flex min-w-full flex-col"
        >
          {options.map((option, index) => {
            const isFirst = index === 0;
            const isLast = index === options.length - 1;
            const optionRadius =
              isFirst && isLast
                ? 'rounded-xl'
                : isFirst
                  ? 'rounded-t-xl'
                  : isLast
                    ? 'rounded-b-xl'
                    : '';

            return (
              <button
                key={`${option}-${index}`}
                type="button"
                role="option"
                aria-selected={option === label}
                onClick={() => onSelect(option)}
                className={`border-gray-2 bg-pure-white text-gray-4 flex h-[29px] w-full items-center border px-2.5 py-1.5 text-left text-[14px] leading-none font-normal whitespace-nowrap ${optionRadius} ${
                  index > 0 ? '-mt-px' : ''
                } ${option === label ? 'text-black' : ''}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default YeogidoCourseFilterChip;
