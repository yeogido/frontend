import { IoSearch } from 'react-icons/io5';

import { useScaleFrame } from '../../hooks/useScaleFrame';

const SEARCH_TRIGGER_DESIGN_WIDTH = 342;
const SEARCH_TRIGGER_HEIGHT = 47;

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
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(SEARCH_TRIGGER_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      className={`w-full overflow-hidden ${className}`}
      style={{ height: scaledHeight }}
    >
      <div
        ref={innerRef}
        style={{
          width: SEARCH_TRIGGER_DESIGN_WIDTH,
          height: SEARCH_TRIGGER_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="border-gray-2 bg-pure-white flex h-full w-full items-center gap-2.5 overflow-hidden rounded-xl border px-[13px] text-left"
        >
          <IoSearch
            aria-hidden="true"
            className="text-gray-4 shrink-0 text-[24px]"
          />
          <span className="text-gray-4 min-w-0 flex-1 truncate text-[12px] leading-normal font-medium">
            {placeholder}
          </span>
        </button>
      </div>
    </div>
  );
}

export default SearchTriggerButton;
