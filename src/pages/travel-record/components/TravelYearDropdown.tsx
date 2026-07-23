import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { IoChevronDown } from 'react-icons/io5';

interface TravelYearDropdownProps {
  value: number;
  years: readonly number[];
  onChange: (year: number) => void;
}

function TravelYearDropdown({
  value,
  years,
  onChange,
}: TravelYearDropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleSelect = (year: number) => {
    onChange(year);
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative mt-4 h-8 w-[86px]">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`여행 기록 연도 선택, 현재 ${value}년`}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-8 w-[86px] items-center justify-center gap-0.5 rounded-full bg-gray-2 px-2 py-1 text-[18px] leading-none font-medium text-gray-4"
      >
        <span>{value}</span>
        <IoChevronDown
          aria-hidden="true"
          className={`size-6 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute top-9 left-0 z-50 flex w-[86px] flex-col items-start"
        >
          {years.map((year, index) => {
            const isFirst = index === 0;
            const isLast = index === years.length - 1;

            return (
              <button
                key={year}
                type="button"
                aria-current={year === value ? 'true' : undefined}
                onClick={() => handleSelect(year)}
                className={`h-8 w-full bg-gray-2 px-2 text-left text-[18px] leading-none font-medium whitespace-nowrap text-gray-4 ${
                  isFirst ? 'rounded-t-xl' : ''
                } ${isLast ? 'rounded-b-xl' : ''}`}
              >
                {year}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default TravelYearDropdown;
