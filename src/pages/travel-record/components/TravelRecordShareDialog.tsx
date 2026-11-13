import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import closeIcon from '../../../assets/icons/share/close.svg';
import instagramIcon from '../../../assets/icons/share/instagram.svg';
import xIcon from '../../../assets/icons/share/x.svg';
import facebookIcon from '../../../assets/icons/share/facebook.svg';
import discordIcon from '../../../assets/icons/share/discord.svg';
import threadsIcon from '../../../assets/icons/share/threads.svg';
import linkedinIcon from '../../../assets/icons/share/linkedin.svg';
import external7Icon from '../../../assets/icons/share/external-7.svg';
import external8Icon from '../../../assets/icons/share/external-8.svg';
import NicknameAvatar from '../../../components/common/NicknameAvatar';
import { useToast } from '../../../components/toast';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { TravelRecordMember } from '../detail/components/TravelRecordMembers';

const externalShareOptions = [
  { name: 'Instagram', icon: instagramIcon },
  { name: 'X', icon: xIcon },
  { name: 'Facebook', icon: facebookIcon },
  { name: 'Discord', icon: discordIcon },
  { name: 'Threads', icon: threadsIcon },
  { name: 'LinkedIn', icon: linkedinIcon },
  { name: '외부 앱 7', icon: external7Icon },
  { name: '외부 앱 8', icon: external8Icon },
] as const;

interface TravelRecordShareDialogProps {
  friendSection?: ReactNode;
  isBusy?: boolean;
  showExternalShare?: boolean;
  title: string;
  children: ReactNode;
  friends: readonly TravelRecordMember[];
  onClose: () => void;
}

function TravelRecordShareDialog({
  friendSection,
  isBusy = false,
  showExternalShare = true,
  title,
  children,
  friends,
  onClose,
}: TravelRecordShareDialogProps) {
  const scale = useGlobalScale();
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
        style={{ width: 342 * scale, maxHeight: 'calc(100dvh - 32px)' }}
      >
        <div
          className="relative"
          style={{ height: friendSection ? undefined : 541 * scale }}
        >
          <div
            className={
              friendSection
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
              className="focus-visible:outline-main-5 absolute top-5 right-5 flex size-6 items-center justify-center rounded focus-visible:outline-2"
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

            {showExternalShare && (
              <ul
                aria-label="외부 앱으로 공유"
                className="scrollbar-hide -mx-5 mt-6 flex w-[calc(100%+40px)] gap-3 overflow-x-auto px-5"
              >
                {externalShareOptions.map((option) => (
                  <li key={option.name} className="shrink-0">
                    <button
                      type="button"
                      aria-label={`${option.name}으로 공유`}
                      disabled={isBusy}
                      onClick={() => showToast('외부 앱 공유는 준비 중이에요.')}
                      className="focus-visible:outline-main-5 block rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2"
                    >
                      <img
                        src={option.icon}
                        alt=""
                        aria-hidden="true"
                        className="block max-w-none"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {friendSection ?? (
              <>
                <fieldset className="mt-5 min-w-0">
                  <legend className="text-sm leading-[17px] font-medium">
                    친구에게 공유
                  </legend>
                  <ul className="scrollbar-hide -mx-5 mt-2 flex w-[calc(100%+40px)] gap-3 overflow-x-auto px-5">
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
