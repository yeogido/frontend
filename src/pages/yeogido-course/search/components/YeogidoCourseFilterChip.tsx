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
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex h-[29px] items-center gap-1 whitespace-nowrap rounded-full border border-[#E5E5E5] bg-white px-[13px] text-[14px] font-normal leading-none text-[#7F7F7F] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      >
        <span>{label}</span>
        <IoChevronDown
          aria-hidden="true"
          className={`text-[13px] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[31px] z-20 min-w-[86px] overflow-hidden rounded-[8px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.14)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`block h-[29px] w-full whitespace-nowrap px-3 text-left text-[14px] font-normal leading-none ${
                option === label
                  ? 'bg-[#F4F4F4] text-[#1C1C1C]'
                  : 'text-[#7F7F7F]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default YeogidoCourseFilterChip;
