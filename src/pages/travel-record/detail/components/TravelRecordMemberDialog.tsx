import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import FriendAvatar from '../../../friends/components/FriendAvatar';
import closeIcon from '../../../../assets/icons/close-rounded.svg';
import { useAuthStore } from '../../../../store/auth.store';
import type { TravelRecordUserProfile } from '../../../../types/travelRecord.type';

interface Props {
  members: TravelRecordUserProfile[];
  onClose: () => void;
}

export default function TravelRecordMemberDialog({ members, onClose }: Props) {
  const navigate = useNavigate();
  const viewerId = useAuthStore((state) => state.userId);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const buttons = Array.from(
        dialog.current?.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)'
        ) ?? []
      );
      const first = buttons[0];
      const last = buttons.at(-1);
      if (first && last && event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        first &&
        last &&
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keydown);
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, [onClose]);
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="travel-members-title"
        className="bg-background w-full max-w-[566px] rounded-[24px] p-9 shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      >
        <div className="flex justify-end">
          <button
            ref={close}
            type="button"
            aria-label="참여자 목록 닫기"
            onClick={onClose}
          >
            <img src={closeIcon} alt="" width={36} height={36} />
          </button>
        </div>
        <h2
          id="travel-members-title"
          className="-mt-2 text-center text-[24px] font-semibold"
        >
          참여자 목록
        </h2>
        <ul className="mt-2 flex max-h-[min(60vh,500px)] flex-col gap-2 overflow-y-auto">
          {members.map((member) => (
            <li key={member.userId}>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    member.userId === viewerId
                      ? '/profile'
                      : `/friends/${member.userId}`
                  )
                }
                className="flex w-full items-center gap-4 py-3 text-left"
              >
                <FriendAvatar
                  userId={member.userId}
                  nickname={member.nickname}
                  profileImageUrl={member.profileImageUrl}
                  size={48}
                />
                <span className="min-w-0 truncate text-[18px] leading-normal font-medium">
                  {member.nickname}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}
