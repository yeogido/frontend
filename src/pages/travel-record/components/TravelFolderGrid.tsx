import TravelFolderCard from './TravelFolderCard';
import TravelRecordInvitationCard from './TravelRecordInvitationCard';

import type { TravelRecordFolder, TravelRecordInvitation } from '../types';

interface TravelFolderGridProps {
  folders: TravelRecordFolder[];
  onFolderClick: (folder: TravelRecordFolder) => void;
  recentlySavedFolderId?: string | null;
  invitations?: TravelRecordInvitation[];
  onAcceptInvitation?: (invitation: TravelRecordInvitation) => void;
  onDeclineInvitation?: (invitationId: string) => void;
  isFiltered?: boolean;
}

const folderListLabel = '\uC5EC\uD589 \uD3F4\uB354 \uBAA9\uB85D';

function TravelFolderGrid({
  folders,
  onFolderClick,
  recentlySavedFolderId,
  invitations = [],
  onAcceptInvitation,
  onDeclineInvitation,
  isFiltered = false,
}: TravelFolderGridProps) {
  if (folders.length === 0 && invitations.length === 0) {
    return (
      <section
        aria-label={folderListLabel}
        className="mt-[142px] flex flex-col items-center text-center"
      >
        <p className="text-gray-4 text-[16px] leading-[22px] font-medium">
          {isFiltered ? (
            '선택한 공개범위의 여행 폴더가 없어요'
          ) : (
            <>
              아직 추가한 여행 기록이 없어요
              <br />+ 버튼을 눌러 여행 기록을 추가해 주세요
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={folderListLabel}
      className="mt-7 grid grid-cols-2 gap-x-6 gap-y-[30px]"
    >
      {onAcceptInvitation &&
        onDeclineInvitation &&
        invitations.map((invitation) => (
          <TravelRecordInvitationCard
            key={invitation.id}
            invitation={invitation}
            onAccept={onAcceptInvitation}
            onDecline={onDeclineInvitation}
          />
        ))}
      {folders.map((folder) => (
        <TravelFolderCard
          key={folder.id}
          folder={folder}
          onClick={onFolderClick}
          isRecentlySaved={String(folder.id) === recentlySavedFolderId}
        />
      ))}
    </section>
  );
}

export default TravelFolderGrid;
