import NicknameAvatar from '../../../../components/common/NicknameAvatar';
import ProfileAvatar from '../../../../components/common/ProfileAvatar';
import TravelRecordShareDialog from '../../components/TravelRecordShareDialog';
import { TravelFolderArtwork } from '../../components/TravelFolderCard';
import {
  FOLDER_ARTWORK_WIDTH,
  FOLDER_FRONT_HEIGHT,
  FOLDER_FRONT_TOP,
  folderClipPath,
} from '../../components/folderArtworkLayout';
import type { TravelRecordFolder } from '../../types';
import type { TravelRecordMember } from './TravelRecordMembers';

interface TravelRecordShareModalProps {
  folder: TravelRecordFolder;
  sharerName: string;
  sharerProfileImageUrl?: string | null;
  friends: readonly TravelRecordMember[];
  onClose: () => void;
}

function TravelRecordShareModal({
  folder,
  sharerName,
  sharerProfileImageUrl,
  friends,
  onClose,
}: TravelRecordShareModalProps) {
  return (
    <TravelRecordShareDialog
      title="여행 폴더 공유"
      friends={friends}
      onClose={onClose}
    >
      <>
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
        {sharerProfileImageUrl ? (
          <ProfileAvatar
            src={sharerProfileImageUrl}
            size={49}
            className="relative z-10 -mt-7 shadow-[0_-2px_10px_rgba(0,0,0,0.25)]"
          />
        ) : (
          <NicknameAvatar
            name={sharerName}
            color="orange"
            size={49}
            className="relative z-10 -mt-7 shadow-[0_-2px_10px_rgba(0,0,0,0.25)]"
          />
        )}
        <p className="mt-2 max-w-full truncate text-center text-sm leading-[17px] font-semibold">
          {sharerName || '사용자'}
        </p>
        <p className="mt-3 max-w-full truncate text-center text-base leading-[19px] font-medium">
          {folder.title}
        </p>
        <time className="bg-gray-2 text-gray-4 mt-1.5 rounded-full px-2 py-1 text-sm leading-[17px]">
          {folder.period}
        </time>
      </>
    </TravelRecordShareDialog>
  );
}

export default TravelRecordShareModal;
