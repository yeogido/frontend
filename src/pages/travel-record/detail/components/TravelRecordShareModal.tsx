import TravelRecordExternalShareActions from '../../components/TravelRecordExternalShareActions';
import { getTravelFolderShareData } from '../../utils/externalShare';
import NicknameAvatar from '../../../../components/common/NicknameAvatar';
import { useEffect, useEffectEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createTravelRecordShareLink } from '../../../../apis/travelRecords.api';
import { useAuthStore } from '../../../../store/auth.store';
import { useToast } from '../../../../components/toast';
import TravelRecordInvitePicker from './TravelRecordInvitePicker';
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

interface TravelRecordShareModalProps {
  folder: TravelRecordFolder;
  sharerName: string;
  sharerProfileImageUrl?: string | null;
  onClose: () => void;
}

function TravelRecordShareModal({
  folder,
  sharerName,
  sharerProfileImageUrl,
  onClose,
}: TravelRecordShareModalProps) {
  const [isBusy, setIsBusy] = useState(false);
  const { showToast } = useToast();
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const canShare =
    folder.permissions?.canLinkShare === true &&
    (folder.visibility === 'public' || folder.visibility === 'friends') &&
    /^\d+$/.test(folder.id) &&
    Number(folder.id) > 0 &&
    userId !== null;
  const shareLink = useQuery({
    queryKey: [
      'travelRecordShareLink',
      userId,
      authGeneration,
      folder.id,
      folder.visibility,
    ],
    queryFn: () => createTravelRecordShareLink(Number(folder.id)),
    enabled: canShare,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
  const notifyShareError = useEffectEvent(() => {
    showToast('공유 링크를 발급하지 못했어요. 다시 시도해 주세요.');
  });
  useEffect(() => {
    if (shareLink.isError) notifyShareError();
  }, [shareLink.isError]);
  return (
    <TravelRecordShareDialog
      title="여행 폴더 공유"
      isBusy={isBusy}
      showExternalShare={canShare}
      externalShareAction={
        <TravelRecordExternalShareActions
          key={`external:${folder.id}:${userId}:${authGeneration}`}
          data={
            shareLink.isFetching || shareLink.isError || !shareLink.data
              ? null
              : getTravelFolderShareData(
                  folder,
                  window.location.origin,
                  shareLink.data.token
                )
          }
          isBusy={isBusy}
          onBusyChange={setIsBusy}
        />
      }
      friendSection={
        <TravelRecordInvitePicker
          key={`${folder.id}:${userId}:${authGeneration}`}
          folder={folder}
          onSent={onClose}
          onBusyChange={setIsBusy}
        />
      }
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
