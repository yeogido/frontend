import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import closeIcon from '../../../assets/icons/share/close.svg';
import NicknameAvatar from '../../../components/common/NicknameAvatar';
import ProfileAvatar from '../../../components/common/ProfileAvatar';
import type { TravelRecordInvitation } from '../types';
import { TravelFolderArtwork } from './TravelFolderCard';

// Figma 1440 데스크톱 시안(6456:26397 공유앨범 수락 팝업) 기준 리터럴 px.
const DIALOG_WIDTH = 480;

interface TravelRecordInvitationDialogProps {
  invitation: TravelRecordInvitation;
  isPending?: boolean;
  onAccept: (invitation: TravelRecordInvitation) => void;
  onDecline: (invitationId: string) => void;
  onClose: () => void;
}

/** 데스크톱에서 초대 폴더를 눌렀을 때 뜨는 수락·거절 팝업. */
function TravelRecordInvitationDialog({
  invitation,
  isPending = false,
  onAccept,
  onDecline,
  onClose,
}: TravelRecordInvitationDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  const { inviterName, folder } = invitation;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${inviterName}님과의 공유앨범`}
        aria-busy={isPending}
        style={{ width: DIALOG_WIDTH }}
        className="relative flex flex-col items-center rounded-[24px] bg-white px-[32px] pt-[32px] pb-[32px] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="팝업 닫기"
          onClick={onClose}
          className="absolute top-[32px] right-[32px] flex size-[24px] items-center justify-center"
        >
          <img
            src={closeIcon}
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
          />
        </button>

        <h2 className="text-gray-5 text-[16px] leading-[24px] font-medium">
          {inviterName}님과의 공유앨범
        </h2>

        {/* 수락 전에는 사진·스티커가 내려오지 않아 빈 폴더로 보여 준다. */}
        <div className="mt-[16px]">
          <TravelFolderArtwork
            photos={[]}
            title={folder.title}
            decorations={[]}
          />
        </div>
        <div className="relative z-10 -mt-[28px] rounded-full shadow-[0_-2px_10px_rgba(0,0,0,0.25)]">
          {invitation.inviterProfileImageUrl ? (
            <ProfileAvatar src={invitation.inviterProfileImageUrl} size={49} />
          ) : (
            <NicknameAvatar
              name={inviterName}
              color={invitation.inviterColor}
              size={49}
            />
          )}
        </div>
        <p className="mt-[8px] text-[14px] font-semibold text-black">
          {inviterName}
        </p>
        <p className="mt-[16px] text-[20px] leading-[24px] font-medium text-black">
          {folder.title}
        </p>
        <time className="bg-gray-2 text-gray-4 mt-[8px] rounded-full px-[12px] py-[6px] text-[16px]">
          {folder.period}
        </time>

        <div className="mt-[32px] flex w-full flex-col gap-[8px]">
          <button
            type="button"
            disabled={isPending}
            onClick={() => onDecline(invitation.id)}
            className="bg-gray-2 text-gray-4 h-[43px] w-full rounded-[8px] text-[14px] font-medium"
          >
            거절하기
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onAccept(invitation)}
            className="bg-main-5 h-[43px] w-full rounded-[8px] text-[14px] font-medium text-white"
          >
            수락하기
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default TravelRecordInvitationDialog;
