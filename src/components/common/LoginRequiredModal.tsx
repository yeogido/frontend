import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import closeIcon from '../../assets/icons/close.svg';
import { GLOBAL_CONTENT_WIDTH } from '../../constants/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';

const MODAL_RADIUS = 12;
const MODAL_PADDING = 20;

const CLOSE_SIZE = 24;
const CLOSE_TOP = 20;
const CLOSE_RIGHT = 20;

const TITLE_SIZE = 18;
const DESCRIPTION_SIZE = 14;

const TITLE_GAP = 4;
const BUTTON_GAP = 8;
const BUTTON_HEIGHT = 43;
const BUTTON_RADIUS = 8;

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

function LoginRequiredModal({
  isOpen,
  onClose,
  onLogin,
}: LoginRequiredModalProps) {
  const scale = useGlobalScale();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    onLogin();
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        aria-describedby="login-required-description"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: GLOBAL_CONTENT_WIDTH * scale,
          borderRadius: MODAL_RADIUS * scale,
          padding: MODAL_PADDING * scale,
        }}
      >
        {/* Close */}
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute flex items-center justify-center"
          style={{
            top: CLOSE_TOP * scale,
            right: CLOSE_RIGHT * scale,
            width: CLOSE_SIZE * scale,
            height: CLOSE_SIZE * scale,
          }}
        >
          <img
            src={closeIcon}
            alt=""
            aria-hidden="true"
            style={{
              width: CLOSE_SIZE * scale,
              height: CLOSE_SIZE * scale,
            }}
          />
        </button>

        {/* Text */}
        <div className="text-center">
          <h2
            id="login-required-title"
            className="font-semibold text-[#1C1C1C]"
            style={{
              fontSize: TITLE_SIZE * scale,
            }}
          >
            로그인 하시겠습니까?
          </h2>

          <p
            id="login-required-description"
            className="font-normal text-[#1C1C1C]"
            style={{
              marginTop: TITLE_GAP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
            }}
          >
            로그인이 필요한 서비스입니다.
          </p>
        </div>

        {/* Buttons */}
        <div
          className="flex"
          style={{
            gap: BUTTON_GAP * scale,
            marginTop: 20 * scale,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#E4E4E4] font-semibold text-[#7F7F7F]"
            style={{
              height: BUTTON_HEIGHT * scale,
              borderRadius: BUTTON_RADIUS * scale,
            }}
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleLogin}
            className="flex-1 bg-[#FF6F41] font-semibold text-white"
            style={{
              height: BUTTON_HEIGHT * scale,
              borderRadius: BUTTON_RADIUS * scale,
            }}
          >
            로그인 하기
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default LoginRequiredModal;