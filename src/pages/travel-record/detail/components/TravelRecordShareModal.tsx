import TravelRecordExternalShareActions from '../../components/TravelRecordExternalShareActions';
import { getTravelFolderShareData } from '../../utils/externalShare';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { createTravelRecordShareLink } from '../../../../apis/travelRecords.api';
import { useAuthStore } from '../../../../store/auth.store';
import { useToast } from '../../../../components/toast';
import TravelRecordInvitePicker from './TravelRecordInvitePicker';
import TravelRecordShareDialog from '../../components/TravelRecordShareDialog';
import TravelFolderSharePreview from './TravelFolderSharePreview';
import { createShareCardPng } from '../../utils/shareCardPng';
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
  const cardRef = useRef<HTMLDivElement>(null);
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
    <>
      {createPortal(
        <div
          aria-hidden="true"
          inert
          style={{
            position: 'fixed',
            left: -10000,
            top: 0,
            pointerEvents: 'none',
          }}
        >
          <div
            ref={cardRef}
            style={{
              width: 254,
              padding: '24px 20px',
              background: '#f9f9f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <TravelFolderSharePreview
              folder={folder}
              sharerName={sharerName}
              sharerProfileImageUrl={sharerProfileImageUrl}
            />
          </div>
        </div>,
        document.body
      )}
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
            createKakaoImage={async () => {
              if (!cardRef.current || !canShare)
                throw new Error('Share card unavailable');
              return createShareCardPng(cardRef.current, [
                ...folder.photos,
                ...folder.decorations.map((item) => item.imageUrl),
                sharerProfileImageUrl ?? '',
              ]);
            }}
          />
        }
        friendSection={
          folder.visibility === 'friends' &&
          folder.permissions?.canInvite === true ? (
            <TravelRecordInvitePicker
              key={`${folder.id}:${userId}:${authGeneration}`}
              folder={folder}
              onSent={onClose}
              onBusyChange={setIsBusy}
            />
          ) : undefined
        }
        onClose={onClose}
      >
        <TravelFolderSharePreview
          folder={folder}
          sharerName={sharerName}
          sharerProfileImageUrl={sharerProfileImageUrl}
        />
      </TravelRecordShareDialog>
    </>
  );
}

export default TravelRecordShareModal;
