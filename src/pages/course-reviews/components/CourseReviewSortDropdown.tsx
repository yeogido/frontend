import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoChevronDown } from 'react-icons/io5';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  courseReviewSortOptions,
  type CourseReviewSort,
} from '../constants/courseReviewSort';

interface CourseReviewSortDropdownProps {
  readonly value: CourseReviewSort;
  readonly onChange: (value: CourseReviewSort) => void;
}

const DROPDOWN_WIDTH = 73;
const DROPDOWN_HEIGHT = 29;
const MENU_GAP = 4;

function CourseReviewSortDropdown({
  value,
  onChange,
}: CourseReviewSortDropdownProps) {
  const scale = useGlobalScale();
  const buttonId = useId();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<
    { top: number; left: number; width: number } | undefined
  >();
  const selectedOption = courseReviewSortOptions.find(
    (option) => option.value === value
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !listboxRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updatePanelStyle = () => {
      const button = rootRef.current?.querySelector('button');
      if (!button) return;

      const rect = button.getBoundingClientRect();
      setPanelStyle({
        top: rect.bottom + MENU_GAP * scale,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePanelStyle();
    window.addEventListener('resize', updatePanelStyle);
    window.addEventListener('scroll', updatePanelStyle, true);

    return () => {
      window.removeEventListener('resize', updatePanelStyle);
      window.removeEventListener('scroll', updatePanelStyle, true);
    };
  }, [isOpen, scale]);

  const handleSelect = (nextValue: CourseReviewSort) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center justify-between rounded-full border border-[#E4E4E4] bg-[#F9F9F9] font-normal text-[#7F7F7F]"
        style={{
          width: DROPDOWN_WIDTH * scale,
          height: DROPDOWN_HEIGHT * scale,
          paddingInline: 10 * scale,
          paddingBlock: 6 * scale,
          fontSize: 14 * scale,
          lineHeight: `${17 * scale}px`,
        }}
      >
        <span>{selectedOption?.label}</span>
        <IoChevronDown
          aria-hidden="true"
          className={`shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ fontSize: 12 * scale }}
        />
      </button>

      {isOpen && panelStyle
        ? createPortal(
            <div
              id={listboxId}
              ref={listboxRef}
              role="listbox"
              aria-labelledby={buttonId}
              className="fixed z-50 flex flex-col overflow-hidden rounded-xl border border-[#E4E4E4] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              style={panelStyle}
            >
              {courseReviewSortOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center border-b border-[#E4E4E4] text-left font-normal text-[#7F7F7F] last:border-b-0 ${
                      isSelected ? 'bg-[#E4E4E4]' : 'bg-white'
                    }`}
                    style={{
                      height: DROPDOWN_HEIGHT * scale,
                      paddingInline: 10 * scale,
                      paddingBlock: 6 * scale,
                      fontSize: 14 * scale,
                      lineHeight: `${17 * scale}px`,
                    }}
                  >
                    {option.label}
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

export default CourseReviewSortDropdown;
