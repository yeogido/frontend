import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoChevronDown } from 'react-icons/io5';

import { businessSortOptions } from '../constants';
import type { BusinessSort } from '../types';

interface BusinessSortDropdownProps {
  value: BusinessSort;
  onChange: (value: BusinessSort) => void;
}

function BusinessSortDropdown({
  value,
  onChange,
}: BusinessSortDropdownProps) {
  const buttonId = useId();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<
    | {
        top: number;
        left: number;
        width: number;
      }
    | undefined
  >();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !listboxRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleSelect = (nextValue: BusinessSort) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePanelStyle = () => {
      const button = rootRef.current?.querySelector('button');

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();

      setPanelStyle({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 73),
      });
    };

    updatePanelStyle();

    window.addEventListener('resize', updatePanelStyle);
    window.addEventListener('scroll', updatePanelStyle, true);

    return () => {
      window.removeEventListener('resize', updatePanelStyle);
      window.removeEventListener('scroll', updatePanelStyle, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      <button
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        className="border-gray-2 bg-white text-gray-4 flex h-[29px] w-[73px] items-center justify-between gap-1 rounded-full border px-2.5 py-1.5 text-[14px] leading-none font-normal whitespace-nowrap cursor-pointer"
      >
        <span>{value}</span>

        <IoChevronDown
          aria-hidden="true"
          className={`shrink-0 text-[12px] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && panelStyle
        ? createPortal(
            <div
              id={listboxId}
              ref={listboxRef}
              role="listbox"
              aria-labelledby={buttonId}
              className="border-gray-2 fixed z-50 flex flex-col overflow-hidden rounded-xl border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              style={{
                top: panelStyle.top,
                left: panelStyle.left,
                width: panelStyle.width,
              }}
            >
              {businessSortOptions.map((option, index) => {
                const isSelected = option === value;
                const isLast = index === businessSortOptions.length - 1;

                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    className={`border-gray-2 bg-white text-gray-4 flex h-[29px] w-full items-center border-b px-2.5 py-1.5 text-left text-[14px] leading-none font-normal whitespace-nowrap cursor-pointer last:border-b-0 ${
                      isSelected ? 'bg-main-1 text-black' : ''
                    } ${isLast ? 'rounded-b-xl' : ''}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default BusinessSortDropdown;
