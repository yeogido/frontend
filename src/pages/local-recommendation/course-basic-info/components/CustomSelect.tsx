import {
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { IoCheckmark, IoChevronDown } from 'react-icons/io5';

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

function CustomSelect<T extends string>({
  id,
  options,
  placeholder,
  value,
  onChange,
}: CustomSelectProps<T>) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0,
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
    index: number,
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

  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

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
          isOpen ? closeListbox() : openListbox(selectedIndex >= 0 ? selectedIndex : 0)
        }
        onKeyDown={handleTriggerKeyDown}
        className={`bg-pure-white focus:border-main-5 flex h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm outline-none transition-colors ${
          isOpen ? 'border-main-5' : 'border-gray-2'
        }`}
      >
        <span className={selectedOption ? 'text-black' : 'text-gray-4'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <IoChevronDown
          aria-hidden="true"
          className={`text-gray-4 shrink-0 text-xl transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className="border-gray-2 bg-pure-white absolute top-full right-0 left-0 z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border p-1.5 shadow-lg"
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
                className={`flex h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm outline-none transition-colors ${
                  isSelected
                    ? 'bg-main-2 text-main-5 font-semibold'
                    : isActive
                      ? 'bg-main-1 text-black'
                      : 'text-gray-5 hover:bg-main-1 focus:bg-main-1'
                }`}
              >
                <span>{option.label}</span>
                {isSelected ? (
                  <IoCheckmark aria-hidden="true" className="shrink-0 text-lg" />
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
