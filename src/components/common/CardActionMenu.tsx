import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import fix from '../../assets/icons/fix.svg';
import { useGlobalScale } from '../../hooks/useGlobalScale';

const MENU_WIDTH = 80;
const MENU_ITEM_HEIGHT = 36;
const MENU_GAP = 4;

export interface CardActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  /** 카드마다 버튼이 놓이는 자리가 달라 트리거 배치는 밖에서 정한다. */
  triggerClassName?: string;
  /** 트리거 아이콘 크기(px, Figma 390 디자인 기준). */
  triggerSize?: number;
  /** 카드 종류마다 스크린리더 안내를 다르게 하려면 넘긴다. */
  ariaLabel?: string;
}

/**
 * 수정 가능한 카드(EditableCourseCard/EditableContentCard)의 우측 상단
 * fix 버튼 메뉴. ReviewActionMenu와 같은 방식으로 패널을 body에 포털로
 * 띄우고 버튼 위치에 맞춰 고정한다 — 카드가 overflow-hidden이라 안에서
 * 그리면 잘린다.
 */
function CardActionMenu({
  onEdit,
  onDelete,
  triggerClassName = '',
  triggerSize = 20,
  ariaLabel = '카드 메뉴',
}: CardActionMenuProps) {
  const scale = useGlobalScale();
  const triggerId = useId();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<
    { top: number; left: number } | undefined
  >();

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePanelStyle = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const width = MENU_WIDTH * scale;

      setPanelStyle({
        top: rect.bottom + MENU_GAP * scale,
        left: Math.max(
          MENU_GAP,
          Math.min(rect.right - width, window.innerWidth - width - MENU_GAP)
        ),
      });
    };

    updatePanelStyle();
    window.addEventListener('resize', updatePanelStyle);

    return () => window.removeEventListener('resize', updatePanelStyle);
  }, [isOpen, scale]);

  const handleSelect = (action?: () => void) => {
    setIsOpen(false);
    action?.();
  };

  const menuItems = [
    { key: 'edit', label: '수정', action: onEdit },
    { key: 'delete', label: '삭제', action: onDelete },
  ];

  return (
    <>
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
        className={`flex shrink-0 items-center justify-center ${triggerClassName}`}
        style={{ width: triggerSize, height: triggerSize }}
      >
        <img
          src={fix}
          alt=""
          aria-hidden="true"
          style={{ width: triggerSize, height: triggerSize }}
        />
      </button>

      {isOpen && panelStyle
        ? createPortal(
            <div
              id={menuId}
              ref={menuRef}
              role="menu"
              aria-labelledby={triggerId}
              onClick={(event) => event.stopPropagation()}
              className="fixed z-50 flex flex-col overflow-hidden rounded-xl border border-[#e4e4e4] bg-[#f9f9f9] shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
              style={{ ...panelStyle, width: MENU_WIDTH * scale }}
            >
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(item.action)}
                  className="flex w-full items-center border-b border-[#e4e4e4] text-left font-medium text-[#7f7f7f] last:border-b-0 hover:bg-[#f1f1f1] focus-visible:bg-[#f1f1f1] focus-visible:outline-none"
                  style={{
                    height: MENU_ITEM_HEIGHT * scale,
                    paddingInline: 12 * scale,
                    fontSize: 13 * scale,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </>
  );
}

export default CardActionMenu;
