import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';

import vector from '../../../../assets/icons/vector.svg';
import { getDropdownPanelPosition } from '../dropdownPosition';

const OPTION_HEIGHT = 46;
const MAX_PANEL_HEIGHT = 184;
const PANEL_GAP = 4;
const VIEWPORT_INSET = 8;

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  ariaLabel: string;
}

// 마이페이지(profile/edit) 드롭다운과 동일한 스타일 — 포털로 띄우는 패널,
// 커스텀 스크롤바, 화면 밖으로 안 나가게 위/아래 자동 전환.
function SelectField({ id, value, onChange, options, ariaLabel }: SelectFieldProps) {
  const buttonId = useId();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasFocusedOnOpenRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>();
  const [scrollThumb, setScrollThumb] = useState<{
    top: number;
    height: number;
  }>();
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];
  const panelHeight = Math.min(options.length * OPTION_HEIGHT, MAX_PANEL_HEIGHT);

  const closeAndRestoreFocus = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const openDropdown = () => {
    const initialIndex = Math.max(
      options.findIndex((option) => option.value === value),
      0
    );

    setActiveIndex(initialIndex);
    hasFocusedOnOpenRef.current = false;
    setIsOpen(true);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', handlePointerDown, true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updatePanelStyle = () => {
      const button = rootRef.current?.querySelector('button');
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const panelPosition = getDropdownPanelPosition({
        triggerTop: rect.top,
        triggerBottom: rect.bottom,
        viewportHeight: window.innerHeight,
        preferredHeight: panelHeight,
        gap: PANEL_GAP,
        viewportInset: VIEWPORT_INSET,
      });

      setPanelStyle({
        top: panelPosition.top,
        left: rect.left,
        width: rect.width,
        height: panelPosition.height,
      });
    };

    updatePanelStyle();
    window.addEventListener('resize', updatePanelStyle);
    window.addEventListener('scroll', updatePanelStyle, true);

    return () => {
      window.removeEventListener('resize', updatePanelStyle);
      window.removeEventListener('scroll', updatePanelStyle, true);
    };
  }, [isOpen, panelHeight]);

  // 열릴 때 선택된 옵션(없으면 첫 옵션)으로 포커스를 옮긴다. panelStyle이
  // 잡히고 포털이 실제로 그려진 뒤에만 옮길 수 있어서, isOpen만으로는
  // 시점을 알 수 없어 panelStyle도 같이 본다. 한 번 연 세션에 한 번만
  // 옮기도록 hasFocusedOnOpenRef로 막는다(리사이즈 등으로 panelStyle이
  // 다시 계산돼도 포커스가 계속 튀지 않게).
  useEffect(() => {
    if (!isOpen || !panelStyle || hasFocusedOnOpenRef.current) return;

    hasFocusedOnOpenRef.current = true;
    optionRefs.current[activeIndex]?.focus();
  }, [isOpen, panelStyle, activeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const updateScrollThumb = () => {
      const listbox = listboxRef.current;
      if (!listbox || listbox.scrollHeight <= listbox.clientHeight) {
        setScrollThumb(undefined);
        return;
      }

      const inset = VIEWPORT_INSET;
      const trackHeight = listbox.clientHeight - inset * 2;
      const thumbHeight =
        (listbox.clientHeight / listbox.scrollHeight) * trackHeight;
      const maxThumbTop = trackHeight - thumbHeight;
      const progress =
        listbox.scrollTop / (listbox.scrollHeight - listbox.clientHeight);

      setScrollThumb({
        top: inset + maxThumbTop * progress,
        height: thumbHeight,
      });
    };

    const animationFrame = requestAnimationFrame(updateScrollThumb);
    const delayedUpdate = window.setTimeout(updateScrollThumb, 0);
    const resizeObserver = new ResizeObserver(updateScrollThumb);
    if (listboxRef.current) {
      resizeObserver.observe(listboxRef.current);
    }
    window.addEventListener('resize', updateScrollThumb);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(delayedUpdate);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollThumb);
    };
  }, [isOpen, options.length]);

  const moveScrollbarToPointer = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    const listbox = listboxRef.current;
    const panel = event.currentTarget.parentElement;
    if (!listbox || !panel || !scrollThumb) return;

    const panelRect = panel.getBoundingClientRect();
    const inset = VIEWPORT_INSET;
    const trackHeight = listbox.clientHeight - inset * 2;
    const maxThumbTop = trackHeight - scrollThumb.height;
    const pointerTop = event.clientY - panelRect.top;
    const nextThumbTop = Math.min(
      Math.max(pointerTop - scrollThumb.height / 2, inset),
      inset + maxThumbTop
    );
    const progress =
      maxThumbTop === 0 ? 0 : (nextThumbTop - inset) / maxThumbTop;

    listbox.scrollTop =
      progress * (listbox.scrollHeight - listbox.clientHeight);
  };

  const focusOption = (index: number) => {
    setActiveIndex(index);
    optionRefs.current[index]?.focus();
  };

  const handleListboxKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusOption(Math.min(activeIndex + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusOption(Math.max(activeIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        focusOption(options.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        closeAndRestoreFocus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id ?? buttonId}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        className="flex h-12 w-full items-center justify-between rounded-[12px] border border-gray-2 bg-white px-4 text-left text-sm font-medium text-gray-4 outline-none focus:border-main-5"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <img
          src={vector}
          alt=""
          aria-hidden="true"
          className="ml-2 h-2.5 w-1.5 shrink-0 transition-transform"
          style={{ transform: `rotate(${isOpen ? -90 : 90}deg)` }}
        />
      </button>

      {isOpen && panelStyle
        ? createPortal(
            <div
              id={listboxId}
              ref={panelRef}
              className="fixed z-[60] overflow-hidden rounded-xl border border-gray-2 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              style={panelStyle}
            >
              <div
                ref={listboxRef}
                role="listbox"
                aria-labelledby={id ?? buttonId}
                onKeyDown={handleListboxKeyDown}
                onScroll={() => {
                  const listbox = listboxRef.current;
                  if (!listbox || !scrollThumb) return;

                  const inset = VIEWPORT_INSET;
                  const trackHeight = listbox.clientHeight - inset * 2;
                  const maxThumbTop = trackHeight - scrollThumb.height;
                  const progress =
                    listbox.scrollTop /
                    (listbox.scrollHeight - listbox.clientHeight);
                  setScrollThumb({
                    top: inset + maxThumbTop * progress,
                    height: scrollThumb.height,
                  });
                }}
                className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {options.map((option, index) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      ref={(el) => {
                        optionRefs.current[index] = el;
                      }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={index === activeIndex ? 0 : -1}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => {
                        onChange(option.value);
                        closeAndRestoreFocus();
                      }}
                      className={`flex w-full items-center border-b border-gray-2 px-3.5 text-left text-sm font-medium text-gray-4 last:border-b-0 outline-none ${isSelected ? 'bg-gray-2' : 'bg-white'}`}
                      style={{ height: OPTION_HEIGHT }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {scrollThumb && (
                <button
                  type="button"
                  aria-label="목록 스크롤"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    moveScrollbarToPointer(event);
                  }}
                  onPointerMove={(event) => {
                    if (
                      event.currentTarget.hasPointerCapture(event.pointerId)
                    ) {
                      moveScrollbarToPointer(event);
                    }
                  }}
                  className="absolute top-0 right-0 bottom-0 w-4 cursor-pointer touch-none"
                >
                  <span
                    aria-hidden="true"
                    className="bg-gray-3 pointer-events-none absolute right-[5px] w-1.5 rounded-full"
                    style={{ top: scrollThumb.top, height: scrollThumb.height }}
                  />
                </button>
              )}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default SelectField;
