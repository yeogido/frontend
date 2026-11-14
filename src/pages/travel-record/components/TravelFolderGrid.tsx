import { useState } from 'react';

import TravelFolderCard from './TravelFolderCard';
import TravelRecordInvitationCard from './TravelRecordInvitationCard';
import TravelRecordInvitationDialog from './TravelRecordInvitationDialog';

import type { TravelRecordFolder, TravelRecordInvitation } from '../types';

interface TravelFolderGridProps {
  folders: TravelRecordFolder[];
  onFolderClick: (folder: TravelRecordFolder) => void;
  recentlySavedFolderId?: string | null;
  invitations?: TravelRecordInvitation[];
  onAcceptInvitation?: (invitation: TravelRecordInvitation) => void;
  onDeclineInvitation?: (invitationId: string) => void;
  isFiltered?: boolean;
  pendingInvitationIds?: Set<string>;
  hideEmptyState?: boolean;
  desktop?: boolean;
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
  pendingInvitationIds,
  hideEmptyState = false,
  desktop = false,
}: TravelFolderGridProps) {
  // 초대가 수락·거절돼 목록에서 사라지면 팝업도 함께 닫힌다.
  const [openedInvitationId, setOpenedInvitationId] = useState<string | null>(
    null
  );
  const openedInvitation = invitations.find(
    (invitation) => invitation.id === openedInvitationId
  );

  if (folders.length === 0 && invitations.length === 0) {
    if (hideEmptyState) return null;
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
    <>
      <section
        aria-label={folderListLabel}
        className={
          desktop
            ? 'mt-[60px] grid grid-cols-3 gap-x-[40px] gap-y-[96px]'
            : 'mt-7 grid grid-cols-2 gap-x-6 gap-y-[30px]'
        }
      >
        {onAcceptInvitation &&
          onDeclineInvitation &&
          invitations.map((invitation) => (
            <TravelRecordInvitationCard
              key={invitation.id}
              invitation={invitation}
              isPending={pendingInvitationIds?.has(invitation.id)}
              onAccept={onAcceptInvitation}
              onDecline={onDeclineInvitation}
              onOpen={
                desktop ? (item) => setOpenedInvitationId(item.id) : undefined
              }
            />
          ))}
        {folders.map((folder) =>
          desktop ? (
            <div key={folder.id} style={{ zoom: 221 / 159 }}>
              <TravelFolderCard
                folder={folder}
                onClick={onFolderClick}
                isRecentlySaved={String(folder.id) === recentlySavedFolderId}
              />
            </div>
          ) : (
            <TravelFolderCard
              key={folder.id}
              folder={folder}
              onClick={onFolderClick}
              isRecentlySaved={String(folder.id) === recentlySavedFolderId}
            />
          )
        )}
      </section>
      {openedInvitation && onAcceptInvitation && onDeclineInvitation ? (
        <TravelRecordInvitationDialog
          invitation={openedInvitation}
          isPending={pendingInvitationIds?.has(openedInvitation.id)}
          onAccept={onAcceptInvitation}
          onDecline={onDeclineInvitation}
          onClose={() => setOpenedInvitationId(null)}
        />
      ) : null}
    </>
  );
}

export default TravelFolderGrid;
