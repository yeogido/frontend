import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  cancelClassName?: string;
  confirmClassName?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 되돌릴 수 없는 동작을 확인받는 다이얼로그.
 *
 * 여행 기록 삭제 다이얼로그의 생김새를 그대로 가져와 공용으로 올린 것이다.
 * 카드 안에서 열리는 경우가 있어(후기 더보기 메뉴) body에 포털로 띄운다.
 */
function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  cancelClassName,
  confirmClassName,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[342px] rounded-2xl bg-[#f9f9f9] p-6"
      >
        <h2 className="text-xl font-semibold text-[#1c1c1c]">{title}</h2>
        {description && (
          // 줄바꿈 위치를 직접 잡는 문구가 있어 개행을 그대로 살린다.
          <p className="mt-3 text-sm whitespace-pre-line text-[#7f7f7f]">
            {description}
          </p>
        )}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={`h-11 flex-1 rounded-xl text-sm font-semibold ${cancelClassName ?? 'bg-[#e4e4e4] text-[#505050]'}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`h-11 flex-1 rounded-xl text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName ?? 'bg-[#ff6f41] text-white'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default ConfirmDialog;
