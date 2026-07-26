import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { IoCheckmark, IoChevronDown } from 'react-icons/io5';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const TRIGGER_HEIGHT = 48;
const TRIGGER_GAP = 12;
const TRIGGER_PADDING_X = 16;
const FONT_SIZE = 14;
const CHEVRON_SIZE = 20;
const LISTBOX_MARGIN_TOP = 8;
const LISTBOX_MAX_HEIGHT = 240;
const LISTBOX_PADDING = 6;
const LISTBOX_VIEWPORT_GUTTER = 8;
const OPTION_HEIGHT = 44;
const OPTION_PADDING_X = 12;
const CHECK_ICON_SIZE = 18;
const LARGE_BORDER_RADIUS = 12;
const SMALL_BORDER_RADIUS = 8;

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface CustomSelectProps<T extends string> {
  id: string;
  options: readonly SelectOption<T>[];
  placeholder: string;
  value?: T;
  onChange: (value: T) => void;
}

type ListboxPlacement = 'above' | 'below';

function CustomSelect<T extends string>({
  id,
  options,
  placeholder,
  value,
  onChange,
}: CustomSelectProps<T>) {
  const scale = useGlobalScale();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0
  );
  const [listboxPlacement, setListboxPlacement] =
    useState<ListboxPlacement>('below');
  const [listboxMaxHeight, setListboxMaxHeight] = useState(
    LISTBOX_MAX_HEIGHT * scale
  );

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updateListboxLayout = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const listboxGap = LISTBOX_MARGIN_TOP * scale;
      const triggerBounds = trigger.getBoundingClientRect();
      const spaceAbove = Math.max(
        0,
        triggerBounds.top -
          viewportTop -
          LISTBOX_VIEWPORT_GUTTER * scale -
          listboxGap
      );
      const spaceBelow = Math.max(
        0,
        viewportBottom -
          triggerBounds.bottom -
          LISTBOX_VIEWPORT_GUTTER * scale -
          listboxGap
      );
      const placement = spaceBelow >= spaceAbove ? 'below' : 'above';

      setListboxPlacement(placement);
      setListboxMaxHeight(
        Math.min(
          LISTBOX_MAX_HEIGHT * scale,
          placement === 'below' ? spaceBelow : spaceAbove
        )
      );
    };

    updateListboxLayout();
    window.addEventListener('resize', updateListboxLayout);
    window.addEventListener('scroll', updateListboxLayout, true);
    window.visualViewport?.addEventListener('resize', updateListboxLayout);
    window.visualViewport?.addEventListener('scroll', updateListboxLayout);

    return () => {
      window.removeEventListener('resize', updateListboxLayout);
      window.removeEventListener('scroll', updateListboxLayout, true);
      window.visualViewport?.removeEventListener('resize', updateListboxLayout);
      window.visualViewport?.removeEventListener('scroll', updateListboxLayout);
    };
  }, [isOpen, scale]);

  const openListbox = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const closeListbox = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;

    onChange(option.value);
    closeListbox(true);
  };

  const moveActiveOption = (index: number) => {
    setActiveIndex((index + options.length) % options.length);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keyToIndex: Partial<Record<string, number>> = {
      ArrowDown: selectedIndex >= 0 ? selectedIndex : 0,
      ArrowUp: selectedIndex >= 0 ? selectedIndex : options.length - 1,
      Home: 0,
      End: options.length - 1,
    };
    const nextIndex = keyToIndex[event.key];

    if (nextIndex !== undefined) {
      event.preventDefault();
      openListbox(nextIndex);
    }
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveOption(index + (event.key === 'ArrowDown' ? 1 : -1));
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      moveActiveOption(event.key === 'Home' ? 0 : options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(index);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeListbox(true);
      return;
    }

    if (event.key === 'Tab') setIsOpen(false);
  };

  const selectedOption =
    selectedIndex >= 0 ? options[selectedIndex] : undefined;

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() =>
          isOpen
            ? closeListbox()
            : openListbox(selectedIndex >= 0 ? selectedIndex : 0)
        }
        onKeyDown={handleTriggerKeyDown}
        className={`focus:border-main-5 flex w-full items-center justify-between border bg-white text-left transition-colors outline-none ${
          isOpen ? 'border-main-5' : 'border-gray-2'
        }`}
        style={{
          height: TRIGGER_HEIGHT * scale,
          gap: TRIGGER_GAP * scale,
          paddingLeft: TRIGGER_PADDING_X * scale,
          paddingRight: TRIGGER_PADDING_X * scale,
          fontSize: FONT_SIZE * scale,
          borderRadius: LARGE_BORDER_RADIUS * scale,
        }}
      >
        <span
          className={`min-w-0 truncate ${
            selectedOption ? 'text-black' : 'text-gray-4'
          }`}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <IoChevronDown
          aria-hidden="true"
          className={`text-gray-4 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ fontSize: CHEVRON_SIZE * scale }}
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className="border-gray-2 absolute right-0 left-0 z-30 overflow-y-auto border bg-white shadow-lg"
          style={{
            top: listboxPlacement === 'below' ? '100%' : undefined,
            bottom: listboxPlacement === 'above' ? '100%' : undefined,
            marginTop:
              listboxPlacement === 'below'
                ? LISTBOX_MARGIN_TOP * scale
                : undefined,
            marginBottom:
              listboxPlacement === 'above'
                ? LISTBOX_MARGIN_TOP * scale
                : undefined,
            maxHeight: listboxMaxHeight,
            padding: LISTBOX_PADDING * scale,
            borderRadius: LARGE_BORDER_RADIUS * scale,
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={isActive ? 0 : -1}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                className={`flex w-full items-center justify-between text-left transition-colors outline-none ${
                  isSelected
                    ? 'bg-main-2 text-main-5 font-semibold'
                    : isActive
                      ? 'bg-main-1 text-black'
                      : 'text-gray-5 hover:bg-main-1 focus:bg-main-1'
                }`}
                style={{
                  height: OPTION_HEIGHT * scale,
                  paddingLeft: OPTION_PADDING_X * scale,
                  paddingRight: OPTION_PADDING_X * scale,
                  fontSize: FONT_SIZE * scale,
                  borderRadius: SMALL_BORDER_RADIUS * scale,
                }}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {isSelected ? (
                  <IoCheckmark
                    aria-hidden="true"
                    className="shrink-0"
                    style={{ fontSize: CHECK_ICON_SIZE * scale }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default CustomSelect;
