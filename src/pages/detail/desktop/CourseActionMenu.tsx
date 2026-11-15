import { useEffect, useId, useRef, useState } from 'react';
import { MdMoreHoriz } from 'react-icons/md';

interface CourseActionMenuProps {
  /** 접근성 이름에 쓰는 코스 제목. */
  readonly label: string;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

/**
 * 코스 상세 제목줄의 더보기(...) 메뉴 - 수정하기, 삭제하기 (Figma 6356:38115).
 * 작성자에게만 보이고, 바깥을 누르거나 Esc를 누르면 닫힌다.
 */
function CourseActionMenu({ label, onEdit, onDelete }: CourseActionMenuProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (action: () => void) => {
    triggerRef.current?.focus();
    setIsOpen(false);
    action();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label + ' 메뉴'}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
        className="text-gray-5 flex size-[32px] items-center justify-center"
      >
        <MdMoreHoriz aria-hidden="true" className="text-[32px]" />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          className="border-gray-2 absolute top-[36px] right-0 z-20 w-[83px] overflow-hidden rounded-[12px] border bg-white"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect(onEdit)}
            className="text-gray-4 hover:bg-gray-2 w-full px-[16px] py-[12px] text-[14px] font-medium"
          >
            수정하기
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect(onDelete)}
            className="text-gray-4 hover:bg-gray-2 border-gray-2 w-full border-t px-[16px] py-[12px] text-[14px] font-medium"
          >
            삭제하기
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default CourseActionMenu;
