import { IoSearch } from 'react-icons/io5';

interface SearchTriggerButtonProps {
  label: string;
  placeholder?: string;
  className?: string;
  onClick: () => void;
}

function SearchTriggerButton({
  label,
  placeholder = '검색어를 입력해 주세요',
  className = '',
  onClick,
}: SearchTriggerButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`border-gray-2 bg-pure-white flex h-[47px] w-full max-w-[342px] items-center gap-2.5 overflow-hidden rounded-xl border px-[13px] text-left ${className}`}
    >
      <IoSearch
        aria-hidden="true"
        className="text-gray-4 shrink-0 text-[24px]"
      />
      <span className="text-gray-4 min-w-0 flex-1 truncate text-[12px] leading-normal font-medium">
        {placeholder}
      </span>
    </button>
  );
}

export default SearchTriggerButton;
