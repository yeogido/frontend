import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import more from '../../assets/icons/more.svg';
import { useGlobalScale } from '../../hooks/useGlobalScale';

// 여행 기록 상세의 작업 메뉴와 같은 치수/생김새를 쓴다.
const TRIGGER_SIZE = 20;
const MENU_WIDTH = 80;
const MENU_ITEM_HEIGHT = 36;
const MENU_GAP = 4;

export interface ReviewActionMenuProps {
  /**
   * 넘기지 않으면 메뉴에서 '수정'이 빠진다. 코스별 후기 응답에는 imageKey가
   * 없어 유지할 사진을 지목할 수 없으므로, 그 응답을 쓰는 화면(코스 상세·
   * 코스 후기 전체보기)은 수정을 열지 않는다.
   */
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  /** 카드마다 버튼이 놓이는 자리가 달라 트리거 배치는 밖에서 정한다. */
  triggerClassName?: string;
  /** 카드 종류마다 스크린리더 안내를 다르게 하려면 넘긴다. */
  ariaLabel?: string;
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
  ariaLabel = '리뷰 메뉴',
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

  // 동작이 붙어 있는 항목만 내보낸다. 후기 화면 넷은 모두 수정·삭제를 다
  // 붙이지만, 핸들러를 넘기지 않은 호출부에서 눌러도 아무 일 없는 항목이
  // 남지 않게 한다.
  const menuItems = [
    { key: 'edit', label: '수정', action: onEditClick },
    { key: 'delete', label: '삭제', action: onDeleteClick },
  ].filter((item) => Boolean(item.action));

  if (menuItems.length === 0) {
    return null;
  }

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

export default ReviewActionMenu;
