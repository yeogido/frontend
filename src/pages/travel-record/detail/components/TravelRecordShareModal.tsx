import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import closeIcon from '../../../../assets/icons/share/close.svg';
import instagramIcon from '../../../../assets/icons/share/instagram.svg';
import xIcon from '../../../../assets/icons/share/x.svg';
import facebookIcon from '../../../../assets/icons/share/facebook.svg';
import discordIcon from '../../../../assets/icons/share/discord.svg';
import threadsIcon from '../../../../assets/icons/share/threads.svg';
import linkedinIcon from '../../../../assets/icons/share/linkedin.svg';
import external7Icon from '../../../../assets/icons/share/external-7.svg';
import external8Icon from '../../../../assets/icons/share/external-8.svg';
import NicknameAvatar from '../../../../components/common/NicknameAvatar';
import { useToast } from '../../../../components/toast';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { TravelFolderArtwork } from '../../components';
import {
  FOLDER_ARTWORK_WIDTH,
  FOLDER_FRONT_HEIGHT,
  FOLDER_FRONT_TOP,
  folderClipPath,
} from '../../components/folderArtworkLayout';
import type { TravelRecordFolder } from '../../types';
import type { TravelRecordMember } from './TravelRecordMembers';

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

interface TravelRecordShareModalProps {
  folder: TravelRecordFolder;
  sharerName: string;
  friends: readonly TravelRecordMember[];
  onClose: () => void;
}

function TravelRecordShareModal({
  folder,
  sharerName,
  friends,
  onClose,
}: TravelRecordShareModalProps) {
  const scale = useGlobalScale();
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled)'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
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
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative overflow-y-auto rounded-xl bg-white shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{ width: 342 * scale, maxHeight: 'calc(100dvh - 32px)' }}
      >
        <div className="relative" style={{ height: 541 * scale }}>
          <div
            className="absolute top-0 left-0 h-[541px] w-[342px] overflow-hidden p-5"
            style={{ zoom: scale }}
          >
            <h2 id={titleId} className="sr-only">
              여행 폴더 공유
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="공유 창 닫기"
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

            <div className="mt-5 flex flex-col items-center">
              <div
                className="relative h-[150px] w-[136px] shrink-0"
                style={{ willChange: 'opacity' }}
              >
                <div className="absolute top-0 left-0 origin-top-left scale-[0.83]">
                  {/* 블러 경계 안에 상세 페이지와 같은 배경을 둔다. */}
                  <div
                    aria-hidden="true"
                    className="bg-background pointer-events-none absolute left-0"
                    style={{
                      top: FOLDER_FRONT_TOP,
                      width: FOLDER_ARTWORK_WIDTH,
                      height: FOLDER_FRONT_HEIGHT,
                      clipPath: folderClipPath,
                      WebkitClipPath: folderClipPath,
                    }}
                  />
                  <TravelFolderArtwork
                    photos={folder.photos}
                    title={folder.title}
                    decorations={folder.decorations}
                  />
                </div>
              </div>
              <NicknameAvatar
                name={sharerName}
                color="orange"
                size={49}
                className="relative z-10 -mt-7 shadow-[0_-2px_10px_rgba(0,0,0,0.25)]"
              />
              <p className="mt-2 max-w-full truncate text-center text-sm leading-[17px] font-semibold">
                {sharerName || '사용자'}
              </p>
              <p className="mt-3 max-w-full truncate text-center text-base leading-[19px] font-medium">
                {folder.title}
              </p>
              <time className="bg-gray-2 text-gray-4 mt-1.5 rounded-full px-2 py-1 text-sm leading-[17px]">
                {folder.period}
              </time>
            </div>

            <ul
              aria-label="외부 앱으로 공유"
              className="scrollbar-hide -mx-5 mt-6 flex w-[calc(100%+40px)] gap-3 overflow-x-auto px-5"
            >
              {externalShareOptions.map((option) => (
                <li key={option.name} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`${option.name}으로 공유`}
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
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default TravelRecordShareModal;
