import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { GLOBAL_CONTENT_WIDTH } from '../../../constants/layout';

// 치수는 LoginRequiredModal을 기준으로 하되, 폭은 양쪽 15씩 좁히고 높이는
// 위아래 여백으로 20 늘렸다.
//
// 아래 여백만 8 줄이고 그만큼을 버튼 위 여백으로 옮겼다. 버튼은 8 내려가고
// 모달 전체 높이는 그대로다.
const MODAL_RADIUS = 12;
const MODAL_PADDING_INLINE = 20;
const MODAL_PADDING_TOP = 30;
const MODAL_PADDING_BOTTOM = 22;
const MODAL_SIDE_INSET = 15;

// 본문 타이포와 버튼은 여기도 전반의 규칙을 따른다. 제목 20/24는 다이얼로그
// 공통(ConfirmDialog), 설명 14/17과 보조 텍스트 #505050은 인증 폼 헤더와 같고,
// 버튼 라운드 12(rounded-xl)는 앱 전역에서 가장 많이 쓰는 값이다.
const TITLE_SIZE = 20;
const TITLE_LINE_HEIGHT = 24;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;

const TITLE_GAP = 8;
const BUTTON_HEIGHT = 48;
const BUTTON_RADIUS = 12;
const BUTTON_FONT_SIZE = 16;
const BUTTON_MARGIN_TOP = 32;

interface BusinessVerificationSuccessDialogProps {
  readonly isOpen: boolean;
  readonly scale: number;
  readonly onConfirm: () => void;
}

/**
 * 사업자 인증 성공을 알리는 모달.
 *
 * 이미 성공한 뒤라 취소할 게 없어 버튼이 하나뿐이다. 폼으로 되돌아가면
 * 이미 인증된 정보를 다시 제출하게 되므로(BUSINESS_VERIFY4091) Esc나 배경
 * 탭도 확인과 똑같이 소상공인 프로필로 넘긴다.
 */
export function BusinessVerificationSuccessDialog({
  isOpen,
  scale,
  onConfirm,
}: BusinessVerificationSuccessDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onConfirm]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={onConfirm}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-verification-success-title"
        aria-describedby="business-verification-success-description"
        onClick={(event) => event.stopPropagation()}
        className="relative bg-white shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: (GLOBAL_CONTENT_WIDTH - MODAL_SIDE_INSET * 2) * scale,
          borderRadius: MODAL_RADIUS * scale,
          paddingInline: MODAL_PADDING_INLINE * scale,
          paddingTop: MODAL_PADDING_TOP * scale,
          paddingBottom: MODAL_PADDING_BOTTOM * scale,
        }}
      >
        <div className="text-center">
          <h2
            id="business-verification-success-title"
            className="font-semibold text-[#1c1c1c]"
            style={{
              fontSize: TITLE_SIZE * scale,
              lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
            }}
          >
            사업자 인증이 완료됐어요
          </h2>

          <p
            id="business-verification-success-description"
            className="text-[#505050]"
            style={{
              marginTop: TITLE_GAP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            이제 홍보 게시물을 등록할 수 있어요
          </p>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="bg-main-5 w-full font-semibold text-[#f9f9f9]"
          style={{
            marginTop: BUTTON_MARGIN_TOP * scale,
            height: BUTTON_HEIGHT * scale,
            borderRadius: BUTTON_RADIUS * scale,
            fontSize: BUTTON_FONT_SIZE * scale,
          }}
        >
          확인
        </button>
      </div>
    </div>,
    document.body
  );
}
