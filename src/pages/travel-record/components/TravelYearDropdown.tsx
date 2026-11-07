import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import yearChevron from '../assets/year-chevron.svg';

interface TravelYearDropdownProps {
  value: number | null;
  years: readonly number[];
  onChange: (year: number) => void;
  onSelectAll?: () => void;
}

function TravelYearDropdown({
  value,
  years,
  onChange,
  onSelectAll,
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

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      onKeyDown={handleTriggerKeyDown}
      className="relative h-[30px] w-[75px] shrink-0"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`여행 기록 연도 선택, 현재 ${value === null ? '전체' : `${value}년`}`}
        onClick={() => setIsOpen((current) => !current)}
        className="border-gray-2 text-gray-4 flex h-[30px] w-full items-center justify-between rounded-full border bg-white px-2.5 py-1.5 text-sm leading-[17px]"
      >
        <span>{value ?? '전체'}</span>
        <img
          src={yearChevron}
          alt=""
          aria-hidden="true"
          className={`block max-w-none shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div className="border-gray-2 absolute top-9 left-0 z-50 flex max-h-60 w-[75px] flex-col items-start overflow-y-auto rounded-xl border bg-white shadow-sm">
          {onSelectAll && (
            <button
              type="button"
              aria-current={value === null ? 'true' : undefined}
              onClick={() => {
                onSelectAll();
                setIsOpen(false);
              }}
              className="text-gray-4 hover:bg-main-2 h-8 w-full shrink-0 px-2.5 text-left text-sm whitespace-nowrap"
            >
              전체
            </button>
          )}
          {years.map((year) => (
            <button
              key={year}
              type="button"
              aria-current={year === value ? 'true' : undefined}
              onClick={() => handleSelect(year)}
              className="text-gray-4 hover:bg-main-2 h-8 w-full shrink-0 px-2.5 text-left text-sm whitespace-nowrap"
            >
              {year}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default TravelYearDropdown;
