import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import closeRounded from '../../../assets/icons/close-rounded.svg';
import { GLOBAL_CONTENT_WIDTH } from '../../../constants/layout';

// 버튼 문구. 시안 문구는 "인증하기"인데 확인 중이라 한곳에 모아 둔다.
export const BUSINESS_VERIFICATION_CONFIRM_LABEL = '인증하기';
export const BUSINESS_VERIFICATION_RESELECT_LABEL = '다시 선택';

// 치수는 성공 다이얼로그(BusinessVerificationSuccessDialog)와 같다. 제목은 두 줄로
// 끊기도록 시안(18)을 따랐고, 닫기 버튼과 버튼 두 개를 위해 구조만 더했다.
const MODAL_RADIUS = 12;
const MODAL_PADDING_INLINE = 20;
const MODAL_PADDING_TOP = 30;
const MODAL_PADDING_BOTTOM = 22;
const MODAL_SIDE_INSET = 15;

const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;

const TITLE_GAP = 20;
const DETAIL_GAP = 8;
const BUTTON_HEIGHT = 48;
const BUTTON_RADIUS = 12;
const BUTTON_FONT_SIZE = 16;
const BUTTON_GAP = 8;
const BUTTON_MARGIN_TOP = 32;
const CLOSE_SIZE = 24;
const CLOSE_OFFSET = 14;

interface BusinessVerificationConfirmDialogProps {
  readonly isOpen: boolean;
  readonly scale: number;
  readonly placeName: string;
  readonly placeAddress: string;
  /** 사업장 정보가 맞아 인증을 진행한다. */
  readonly onConfirm: () => void;
  /** 선택한 장소를 지우고 다시 고르러 간다. */
  readonly onReselect: () => void;
  /** 선택은 그대로 두고 닫는다(X, Esc, 배경). */
  readonly onClose: () => void;
}

/**
 * 인증을 제출하기 전에, 선택한 가게가 사업자등록증의 사업장과 같은지 확인받는
 * 모달. 모바일과 데스크톱이 같이 쓸 수 있도록 크기는 scale로 받는다(데스크톱은 1).
 */
export function BusinessVerificationConfirmDialog({
  isOpen,
  scale,
  placeName,
  placeAddress,
  onConfirm,
  onReselect,
  onClose,
}: BusinessVerificationConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 배경 스크롤 잠금.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // 부모가 매 렌더 새로 만들어 넘기므로 의존성에서 빼서, 리렌더 때 포커스가
  // 처음 자리로 되돌아가지 않게 한다.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // 어느 버튼도 먼저 눌리지 않도록 닫기 버튼에 포커스를 둔다.
    closeButtonRef.current?.focus();

    const getFocusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled])'
        ) ?? []
      );

    const handleFocusIn = (event: FocusEvent) => {
      const dialog = dialogRef.current;

      if (dialog && !dialog.contains(event.target as Node)) {
        closeButtonRef.current?.focus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!first || !last) return;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      // click은 누른 곳과 뗀 곳의 공통 조상에서 발생해서, 패널 안에서 드래그를
      // 시작해 배경에서 놓으면 닫혀 버린다. 배경을 직접 누른 때만 닫는다.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-verification-confirm-title"
        aria-describedby="business-verification-confirm-description"
        className="relative bg-white shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: (GLOBAL_CONTENT_WIDTH - MODAL_SIDE_INSET * 2) * scale,
          borderRadius: MODAL_RADIUS * scale,
          paddingInline: MODAL_PADDING_INLINE * scale,
          paddingTop: MODAL_PADDING_TOP * scale,
          paddingBottom: MODAL_PADDING_BOTTOM * scale,
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute flex items-center justify-center"
          style={{
            top: CLOSE_OFFSET * scale,
            right: CLOSE_OFFSET * scale,
            width: CLOSE_SIZE * scale,
            height: CLOSE_SIZE * scale,
          }}
        >
          <img src={closeRounded} alt="" aria-hidden="true" />
        </button>

        <div className="text-center">
          <h2
            id="business-verification-confirm-title"
            className="font-semibold text-[#1c1c1c]"
            style={{
              fontSize: TITLE_SIZE * scale,
              lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
            }}
          >
            선택한 가게가 사업자등록증의
            <br />
            사업장과 같은지 확인해 주세요.
          </h2>

          <div
            id="business-verification-confirm-description"
            className="flex flex-col text-[#505050]"
            style={{
              marginTop: TITLE_GAP * scale,
              gap: DETAIL_GAP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            <p className="break-words">장소명: {placeName}</p>
            <p className="break-words">주소: {placeAddress}</p>
          </div>
        </div>

        <div
          className="flex"
          style={{
            marginTop: BUTTON_MARGIN_TOP * scale,
            gap: BUTTON_GAP * scale,
          }}
        >
          <button
            type="button"
            onClick={onReselect}
            className="flex-1 bg-[#e4e4e4] font-semibold text-[#7f7f7f]"
            style={{
              height: BUTTON_HEIGHT * scale,
              borderRadius: BUTTON_RADIUS * scale,
              fontSize: BUTTON_FONT_SIZE * scale,
            }}
          >
            {BUSINESS_VERIFICATION_RESELECT_LABEL}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-main-5 flex-1 font-semibold text-[#f9f9f9]"
            style={{
              height: BUTTON_HEIGHT * scale,
              borderRadius: BUTTON_RADIUS * scale,
              fontSize: BUTTON_FONT_SIZE * scale,
            }}
          >
            {BUSINESS_VERIFICATION_CONFIRM_LABEL}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
