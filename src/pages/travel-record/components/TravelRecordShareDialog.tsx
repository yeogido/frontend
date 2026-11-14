import TravelRecordExternalShareActions from './TravelRecordExternalShareActions';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import closeIcon from '../../../assets/icons/share/close.svg';
import NicknameAvatar from '../../../components/common/NicknameAvatar';
import { useToast } from '../../../components/toast';
import { hasDesktopView } from '../../../constants/desktopRoutes';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import type { TravelRecordMember } from '../detail/components/TravelRecordMembers';

interface TravelRecordShareDialogProps {
  friendSection?: ReactNode;
  externalShareAction?: ReactNode;
  isBusy?: boolean;
  showExternalShare?: boolean;
  title: string;
  children: ReactNode;
  friends: readonly TravelRecordMember[];
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
  friends,
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
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const { showToast } = useToast();

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

  const toggleFriend = (friendId: string) => {
    setSelectedFriendIds((ids) =>
      ids.includes(friendId)
        ? ids.filter((id) => id !== friendId)
        : [...ids, friendId]
    );
  };

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
        <div
          className="relative"
          style={{
            height: friendSection || isDesktopLayout ? undefined : 541 * scale,
          }}
        >
          <div
            className={
              isDesktopLayout
                ? 'relative w-full p-8'
                : friendSection
                  ? 'relative w-[342px] p-5'
                  : 'absolute top-0 left-0 h-[541px] w-[342px] overflow-hidden p-5'
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

            {friendSection ?? (
              <>
                <fieldset
                  className={`min-w-0 ${isDesktopLayout ? 'mt-8' : 'mt-5'}`}
                >
                  <legend className="text-sm leading-[17px] font-medium">
                    친구에게 공유
                  </legend>
                  <ul
                    className={`scrollbar-hide mt-2 flex gap-3 overflow-x-auto ${
                      isDesktopLayout ? '' : '-mx-5 w-[calc(100%+40px)] px-5'
                    }`}
                  >
                    {friends.map((friend) => {
                      const isSelected = selectedFriendIds.includes(friend.id);

                      return (
                        <li key={friend.id} className="shrink-0">
                          <button
                            type="button"
                            aria-label={`${friend.name} 선택`}
                            aria-pressed={isSelected}
                            title={friend.name}
                            onClick={() => toggleFriend(friend.id)}
                            className="focus-visible:outline-main-5 relative block rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2"
                          >
                            <NicknameAvatar
                              name={friend.name}
                              color={friend.color}
                              size={48}
                            />
                            {isSelected && (
                              <span
                                aria-hidden="true"
                                className="border-main-5 bg-main-5/50 pointer-events-none absolute inset-0 rounded-full border-2"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>

                <button
                  type="button"
                  disabled={selectedFriendIds.length === 0}
                  onClick={() => showToast('친구 초대 전송은 준비 중이에요.')}
                  className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 mt-4 flex h-[43px] w-full items-center justify-center rounded-lg text-base font-semibold text-white disabled:cursor-not-allowed"
                >
                  보내기
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default TravelRecordShareDialog;
