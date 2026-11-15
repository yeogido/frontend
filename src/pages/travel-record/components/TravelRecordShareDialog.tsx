import TravelRecordExternalShareActions from './TravelRecordExternalShareActions';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import closeIcon from '../../../assets/icons/share/close.svg';
import { hasDesktopView } from '../../../constants/desktopRoutes';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useIsDesktop } from '../../../hooks/useIsDesktop';

interface TravelRecordShareDialogProps {
  friendSection?: ReactNode;
  externalShareAction?: ReactNode;
  isBusy?: boolean;
  showExternalShare?: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

// Figma 1440 데스크톱 시안(6336:73049) 기준 리터럴 px.
const DESKTOP_DIALOG_WIDTH = 600;

function TravelRecordShareDialog({
  friendSection,
  externalShareAction,
  isBusy = false,
  showExternalShare = true,
  title,
  children,
  onClose,
}: TravelRecordShareDialogProps) {
  const scale = useGlobalScale();
  // 데스크톱 뷰가 있는 화면(1440 시안)에서만 600px 폭으로 키운다.
  const { pathname } = useLocation();
  const isDesktopLayout = useIsDesktop() && hasDesktopView(pathname);
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isBusyRef = useRef(isBusy);

  useEffect(() => {
    isBusyRef.current = isBusy;
    if (isBusy) dialogRef.current?.focus();
  }, [isBusy]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusyRef.current) {
        event.preventDefault();
        onClose();
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled)'
      );
      if (!focusable?.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialogRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isBusy) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby={titleId}
        className="relative overflow-y-auto rounded-xl bg-white shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: isDesktopLayout ? DESKTOP_DIALOG_WIDTH : 342 * scale,
          maxHeight: 'calc(100dvh - 32px)',
        }}
      >
        <div className="relative">
          <div
            className={
              isDesktopLayout ? 'relative w-full p-8' : 'relative w-[342px] p-5'
            }
            style={{ zoom: scale }}
          >
            <h2 id={titleId} className="sr-only">
              {title}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="공유 창 닫기"
              disabled={isBusy}
              onClick={onClose}
              className={`focus-visible:outline-main-5 absolute flex size-6 items-center justify-center rounded focus-visible:outline-2 ${
                isDesktopLayout ? 'top-8 right-8' : 'top-5 right-5'
              }`}
            >
              <img
                src={closeIcon}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
            </button>

            <div className="mt-5 flex flex-col items-center">{children}</div>

            {showExternalShare &&
              (externalShareAction ?? (
                <TravelRecordExternalShareActions data={null} isBusy={isBusy} />
              ))}

            {friendSection}
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default TravelRecordShareDialog;
