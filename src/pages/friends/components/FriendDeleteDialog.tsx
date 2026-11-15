import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import closeRounded from '../../../assets/icons/close-rounded.svg';
import type { FriendSummary } from '../../../types/friend.type';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const PAGE_PADDING_X = 24;
const CARD_MAX_WIDTH = 342;
const CARD_PADDING = 20;
const CARD_RADIUS = 12;
const CLOSE_ICON_SIZE = 24;
const CONTENT_GAP = 32;
const TEXT_GAP = 4;
const TITLE_SIZE = 18;
const DESCRIPTION_SIZE = 14;
const BUTTON_GAP = 8;
const BUTTON_PADDING_X = 10;
const BUTTON_PADDING_Y = 12;
const BUTTON_RADIUS = 8;
const BUTTON_TEXT_SIZE = 16;

interface FriendDeleteDialogProps {
  /** null이면 닫혀 있다. */
  friend: FriendSummary | null;
  isPending: boolean;
  scale: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 친구 삭제를 확인받는 다이얼로그.
 *
 * 배경을 눌러서는 닫히지 않고 X·취소·Esc로만 닫힌다. 삭제 요청 중에는
 * 어느 쪽으로도 닫히지 않는다. 포커스는 열릴 때 취소 버튼으로 들어오고,
 * 닫힐 때 어디로 돌려줄지는 결과(취소, 삭제 성공)를 아는 부모가 정한다.
 */
function FriendDeleteDialog({
  friend,
  isPending,
  scale,
  onConfirm,
  onCancel,
}: FriendDeleteDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = friend !== null;

  // 삭제 중에는 눌러 볼 버튼이 모두 비활성이라, 포커스가 사라지지 않도록
  // 패널에 둔다. 요청이 실패해 다시 열린 상태로 돌아오면 취소 버튼이 받는다.
  useEffect(() => {
    if (!isOpen) return;

    if (isPending) {
      panelRef.current?.focus();
    } else {
      cancelButtonRef.current?.focus();
    }
  }, [isOpen, isPending]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!isPending) onCancel();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>('button:not([disabled])')
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!first || !last) {
        event.preventDefault();
        panel.focus();
      } else if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onCancel]);

  if (!friend || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      style={{ paddingInline: PAGE_PADDING_X * scale }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isPending}
        tabIndex={-1}
        className="bg-pure-white flex w-full flex-col items-end outline-none"
        style={{
          maxWidth: CARD_MAX_WIDTH * scale,
          padding: CARD_PADDING * scale,
          borderRadius: CARD_RADIUS * scale,
          boxShadow: '0 1px 5px rgba(0, 0, 0, 0.07)',
        }}
      >
        <button
          type="button"
          aria-label="닫기"
          disabled={isPending}
          onClick={onCancel}
          className="disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            width: CLOSE_ICON_SIZE * scale,
            height: CLOSE_ICON_SIZE * scale,
          }}
        >
          <img
            src={closeRounded}
            alt=""
            aria-hidden="true"
            className="size-full"
          />
        </button>
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: CONTENT_GAP * scale }}
        >
          <div
            className="flex flex-col items-center text-center text-black"
            style={{ gap: TEXT_GAP * scale, lineHeight: 'normal' }}
          >
            <h2
              id={titleId}
              className="font-semibold"
              style={{ fontSize: TITLE_SIZE * scale }}
            >
              친구를 삭제하시겠습니까?
              <span className="sr-only"> {friend.nickname}</span>
            </h2>
            <p
              id={descriptionId}
              className="whitespace-pre-line"
              style={{ fontSize: DESCRIPTION_SIZE * scale }}
            >
              {
                '친구를 삭제하면 함께 공유했던 앨범도\n함께 삭제되며, 이후 복구할 수 없습니다.'
              }
            </p>
          </div>
          <div className="flex w-full" style={{ gap: BUTTON_GAP * scale }}>
            <button
              type="button"
              disabled={isPending}
              onClick={onConfirm}
              className="bg-main-5 flex-1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                padding: `${BUTTON_PADDING_Y * scale}px ${BUTTON_PADDING_X * scale}px`,
                borderRadius: BUTTON_RADIUS * scale,
                fontSize: BUTTON_TEXT_SIZE * scale,
                lineHeight: 'normal',
              }}
            >
              삭제하기
            </button>
            <button
              ref={cancelButtonRef}
              type="button"
              disabled={isPending}
              onClick={onCancel}
              className="bg-gray-2 text-gray-4 flex-1 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                padding: `${BUTTON_PADDING_Y * scale}px ${BUTTON_PADDING_X * scale}px`,
                borderRadius: BUTTON_RADIUS * scale,
                fontSize: BUTTON_TEXT_SIZE * scale,
                lineHeight: 'normal',
              }}
            >
              취소
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default FriendDeleteDialog;
