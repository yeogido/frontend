import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import yearChevron from '../assets/year-chevron.svg';

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
    <div ref={rootRef} className="relative h-[30px] w-[75px] shrink-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`여행 기록 연도 선택, 현재 ${value}년`}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className="border-gray-2 text-gray-4 flex h-[30px] w-full items-center justify-between rounded-full border bg-white px-2.5 py-1.5 text-sm leading-[17px]"
      >
        <span>{value}</span>
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
        <div className="border-gray-2 absolute top-9 left-0 z-50 flex w-[75px] flex-col items-start overflow-hidden rounded-xl border bg-white shadow-sm">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              aria-current={year === value ? 'true' : undefined}
              onClick={() => handleSelect(year)}
              className="text-gray-4 hover:bg-main-2 h-8 w-full px-2.5 text-left text-sm whitespace-nowrap"
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
