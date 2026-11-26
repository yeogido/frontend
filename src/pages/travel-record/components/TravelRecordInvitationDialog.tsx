import { useEffect, useEffectEvent, useRef } from 'react';
import { createPortal } from 'react-dom';

import closeIcon from '../../../assets/icons/share/close.svg';
import NicknameAvatar from '../../../components/common/NicknameAvatar';
import ProfileAvatar from '../../../components/common/ProfileAvatar';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import type { TravelRecordInvitation } from '../types';
import { TravelFolderArtwork } from './TravelFolderCard';
import {
  FOLDER_ARTWORK_WIDTH,
  FOLDER_FRONT_HEIGHT,
  FOLDER_FRONT_TOP,
  folderClipPath,
} from './folderArtworkLayout';

interface TravelRecordInvitationDialogProps {
  invitation: TravelRecordInvitation;
  isPending?: boolean;
  automatic?: boolean;
  onAccept: (invitation: TravelRecordInvitation) => void;
  onDecline: (invitationId: string) => void;
  onClose: () => void;
}

/** Shared by automatic invitations and the dashed folder cards. */
function TravelRecordInvitationDialog({
  invitation,
  isPending = false,
  automatic = false,
  onAccept,
  onDecline,
  onClose,
}: TravelRecordInvitationDialogProps) {
  const desktop = useIsDesktop();
  const scale = useGlobalScale();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (!isPending) onClose();
    }
    if (event.key !== 'Tab') return;
    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
      'button:not(:disabled)'
    );
    if (!buttons?.length) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (
      !dialogRef.current?.contains(document.activeElement) ||
      document.activeElement === dialogRef.current
    ) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    if (isPending) dialogRef.current?.focus();
  }, [isPending]);

  const { inviterName, folder } = invitation;
  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4 pb-4 ${desktop ? 'pt-4' : 'pt-16'}`}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${inviterName}님과의 공유앨범`}
        aria-busy={isPending}
        data-automatic-travel-invitation={automatic ? '' : undefined}
        tabIndex={-1}
        style={{
          width: desktop ? 480 : 342 * scale,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: desktop ? 'calc(100dvh - 32px)' : 'calc(100dvh - 80px)',
        }}
        className={`relative overflow-y-auto shadow-[0_1px_5px_rgba(0,0,0,0.07)] ${desktop ? 'rounded-[24px] bg-white' : 'rounded-[12px] bg-[#f9f9f9]'}`}
      >
        <div
          className={`relative flex flex-col items-center ${desktop ? 'p-8' : 'p-5'}`}
          style={{ zoom: desktop ? 1 : scale }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="팝업 닫기"
            disabled={isPending}
            onClick={onClose}
            className={`focus-visible:outline-main-5 absolute flex size-6 items-center justify-center rounded focus-visible:outline-2 ${desktop ? 'top-8 right-8' : 'top-5 right-5'}`}
          >
            <img
              src={closeIcon}
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
            />
          </button>
          <h2
            title={`${inviterName}님과의 공유앨범`}
            className={`text-gray-5 w-full truncate text-center leading-6 ${desktop ? 'text-[16px] font-medium' : 'mt-9 text-[20px] font-semibold'}`}
          >
            {inviterName}님과의 공유앨범
          </h2>
          <div
            className={`relative mt-4 shrink-0 ${desktop ? 'h-[183px] w-[159px]' : 'h-[150px] w-[136px]'}`}
            style={{ willChange: 'opacity' }}
          >
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{ transform: desktop ? undefined : 'scale(0.83)' }}
            >
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
                photos={folder.photos ?? []}
                title={folder.title}
                decorations={folder.decorations ?? []}
              />
            </div>
          </div>
          <div className="bg-main-3 relative z-10 -mt-7 size-[49px] shrink-0 overflow-hidden rounded-full shadow-[0_-2px_10px_rgba(0,0,0,0.25)]">
            {invitation.inviterProfileImageUrl ? (
              <ProfileAvatar
                src={invitation.inviterProfileImageUrl}
                nickname={inviterName}
                size={49}
              />
            ) : (
              <NicknameAvatar name={inviterName} color="orange" size={49} />
            )}
          </div>
          <p
            className="mt-2 max-w-full truncate text-center text-[14px] leading-[17px] font-semibold text-black"
            title={inviterName}
          >
            {inviterName}
          </p>
          <p
            className={`max-w-full truncate text-center font-medium text-black ${desktop ? 'mt-4 text-[20px] leading-6' : 'mt-3 text-[16px] leading-[19px]'}`}
            title={folder.title}
          >
            {folder.regionName || folder.title}
          </p>
          <time
            className={`bg-gray-2 text-gray-4 rounded-full ${desktop ? 'mt-2 px-3 py-1.5 text-[16px]' : 'mt-1.5 px-2 py-1 text-[14px] leading-[17px]'}`}
          >
            {folder.period}
          </time>
          <div
            className={`flex w-full flex-col ${desktop ? 'mt-8 gap-2' : 'mt-6 gap-3'}`}
          >
            <button
              type="button"
              disabled={isPending}
              onClick={() => onDecline(invitation.id)}
              className={`bg-gray-2 text-gray-4 h-[43px] w-full rounded-lg disabled:cursor-not-allowed ${desktop ? 'text-[14px] font-medium' : 'text-[16px] font-semibold'}`}
            >
              거절하기
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onAccept(invitation)}
              className={`bg-main-5 text-pure-white h-[43px] w-full rounded-lg disabled:cursor-not-allowed ${desktop ? 'text-[14px] font-medium' : 'text-[16px] font-semibold'}`}
            >
              수락하기
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default TravelRecordInvitationDialog;
