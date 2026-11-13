import { useEffect, useId, useRef, useState } from 'react';
import { MdExpandMore } from 'react-icons/md';

// Figma 1440 데스크톱 시안(6303:50136) 기준 리터럴 px.
const TRIGGER_HEIGHT = 37;
const MENU_GAP = 8;

interface DesktopFilterDropdownProps<TOption extends string> {
  readonly label: string;
  readonly options: readonly TOption[];
  readonly value: TOption;
  readonly onChange: (option: TOption) => void;
  /** 메뉴를 트리거의 왼쪽 끝 / 오른쪽 끝 중 어디에 맞출지. */
  readonly align?: 'left' | 'right';
}

/**
 * 알약 모양 필터 드롭다운. 열린 메뉴는 아래 콘텐츠 위에 겹쳐 뜬다.
 * 바깥을 누르거나 Esc를 누르면 닫힌다.
 */
function DesktopFilterDropdown<TOption extends string>({
  label,
  options,
  value,
  onChange,
  align = 'left',
}: DesktopFilterDropdownProps<TOption>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    // 포커스를 받은 옵션 버튼이 메뉴와 함께 사라지므로, 닫으면서 트리거로 돌려준다.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (option: TOption) => {
    onChange(option);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${label}: ${value}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
        style={{ height: TRIGGER_HEIGHT }}
        className="border-gray-2 text-gray-4 flex items-center gap-[8px] rounded-full border bg-white px-[10px] text-[18px] whitespace-nowrap"
      >
        {value}
        <MdExpandMore
          aria-hidden="true"
          className={`text-[16px] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <ul
          id={menuId}
          role="listbox"
          aria-label={label}
          style={{ top: TRIGGER_HEIGHT + MENU_GAP }}
          className={`border-gray-2 absolute z-20 min-w-full overflow-hidden rounded-[12px] border bg-white ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option, index) => {
            const isSelected = option === value;

            return (
              <li
                key={option}
                role="option"
                aria-selected={isSelected}
                className={index > 0 ? 'border-gray-2 border-t' : ''}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`text-gray-4 w-full px-[10px] py-[8px] text-left text-[18px] whitespace-nowrap ${
                    isSelected ? 'bg-gray-2' : 'bg-white'
                  }`}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default DesktopFilterDropdown;
