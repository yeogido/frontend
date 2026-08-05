import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import more from '../../assets/icons/more.svg';
import { useGlobalScale } from '../../hooks/useGlobalScale';

// 여행 기록 상세의 작업 메뉴와 같은 치수/생김새를 쓴다.
const TRIGGER_SIZE = 20;
const MENU_WIDTH = 104;
const MENU_ITEM_HEIGHT = 42;
const MENU_GAP = 8;

export interface ReviewActionMenuProps {
  /**
   * 수정 화면이 아직 없어 넘기는 곳이 없다. 메뉴에는 항목이 보이지만 눌러도
   * 아무 일도 일어나지 않는다. 화면을 못 만드는 이유는 types/review.type.ts의
   * 수정 요청 타입 주석 참고.
   */
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  /** 카드마다 버튼이 놓이는 자리가 달라 트리거 배치는 밖에서 정한다. */
  triggerClassName?: string;
}

/**
 * 본인이 쓴 후기 카드의 더보기(⋯) 메뉴.
 *
 * 정렬 드롭다운과 같은 방식으로, 패널을 body에 포털로 띄우고 버튼 위치에
 * 맞춰 고정한다. 카드가 overflow-hidden이라 안에서 그리면 잘린다.
 */
function ReviewActionMenu({
  onEditClick,
  onDeleteClick,
  triggerClassName = '-mt-[3px] -mr-[3px] ml-2',
}: ReviewActionMenuProps) {
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
        // 카드 오른쪽 끝에 붙은 버튼이라 오른쪽 정렬로 띄우되, 화면 밖으로
        // 나가지 않게 가둔다.
        left: Math.max(MENU_GAP, Math.min(rect.right - width, window.innerWidth - width - MENU_GAP)),
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

  const handleSelect = (action?: () => void) => {
    setIsOpen(false);
    action?.();
  };

  // 수정은 화면이 아직 없어 항상 자리만 잡아 둔다. 삭제는 동작이 붙어 있을
  // 때만 내보낸다.
  const menuItems = [
    { key: 'edit', label: '수정', action: onEditClick },
    { key: 'delete', label: '삭제', action: onDeleteClick },
  ].filter((item) => item.key === 'edit' || Boolean(item.action));

  return (
    <>
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        aria-label="리뷰 메뉴"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
        className={`flex shrink-0 items-center justify-center ${triggerClassName}`}
        style={{ width: TRIGGER_SIZE, height: TRIGGER_SIZE }}
      >
        <img
          src={more}
          alt=""
          aria-hidden="true"
          style={{ width: TRIGGER_SIZE, height: TRIGGER_SIZE }}
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
              className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-[#e4e4e4] bg-[#f9f9f9] shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
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
                    paddingInline: 16 * scale,
                    fontSize: 14 * scale,
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

export default ReviewActionMenu;
