import NicknameAvatar from '../../../components/common/NicknameAvatar';
import invitationFolder from '../assets/invitation-folder.svg';
import type { TravelRecordInvitation } from '../types';

interface TravelRecordInvitationCardProps {
  invitation: TravelRecordInvitation;
  onAccept: (invitation: TravelRecordInvitation) => void;
  onDecline: (invitationId: string) => void;
}

function TravelRecordInvitationCard({
  invitation,
  onAccept,
  onDecline,
}: TravelRecordInvitationCardProps) {
  return (
    <article
      aria-label={`${invitation.inviterName}님의 ${invitation.folder.title} 앨범 초대`}
      className="w-[159px] pt-[43px]"
    >
      <div className="relative h-[140px] w-full">
        <img
          src={invitationFolder}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-0.5 -left-0.5 max-w-none"
        />
        <div className="absolute inset-x-0 top-8 flex flex-col items-center gap-3 px-2">
          <NicknameAvatar
            name={invitation.inviterName}
            color={invitation.inviterColor}
            size={36}
          />
          <p
            className="text-gray-5 max-w-full truncate text-center text-xs leading-[14px] font-medium"
            title={`${invitation.inviterName}님이 초대했어요`}
          >
            {invitation.inviterName}님이 초대했어요
          </p>
          <p
            className="text-gray-4 max-w-full truncate text-center text-xs leading-[14px]"
            title={`${invitation.folder.title} · ${invitation.folder.period}`}
          >
            {invitation.folder.title} · {invitation.folder.period}
          </p>
        </div>
      </div>
      <div className="mt-[21px] flex gap-1">
        <button
          type="button"
          onClick={() => onDecline(invitation.id)}
          aria-label={`${invitation.inviterName}님의 초대 거절`}
          className="border-gray-2 text-gray-4 h-8 flex-1 rounded-lg border bg-white text-xs font-medium"
        >
          거절
        </button>
        <button
          type="button"
          onClick={() => onAccept(invitation)}
          aria-label={`${invitation.inviterName}님의 초대 수락`}
          className="bg-main-5 text-pure-white h-8 flex-1 rounded-lg text-xs font-medium"
        >
          수락
        </button>
      </div>
    </article>
  );
}

export default TravelRecordInvitationCard;
