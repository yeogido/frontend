import ProfileAvatar from '../../../components/common/ProfileAvatar';
import mapSharerIcon from '../../../assets/icons/share/map-sharer.svg';
import { useMyProfile } from '../../../hooks/useMyProfile';
import Map from '../../home/map/components/Map';
import TravelRecordShareDialog from './TravelRecordShareDialog';
import TravelRecordExternalShareActions from './TravelRecordExternalShareActions';
import { getTravelMapShareData } from '../utils/externalShare';
import { useAuthStore } from '../../../store/auth.store';
import { useRef, useState } from 'react';
import { useTravelMap } from '../../../hooks/useTravelMap';
import { toRegionPhotoMap } from '../../home/map/types/regionPhoto';
import { getTravelRecordRegionPhotoRecords } from '../utils/regionPhotoRecords';
import { filterTravelMapFoldersByYear } from '../utils/mapYears';
import { createShareCardPng } from '../utils/shareCardPng';

interface TravelMapShareModalProps {
  selectedYear: number | null;
  onClose: () => void;
}

function TravelMapShareModal({
  selectedYear,
  onClose,
}: TravelMapShareModalProps) {
  const { data: profile } = useMyProfile();
  const userId = useAuthStore((state) => state.userId);
  const [isBusy, setIsBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mapQuery = useTravelMap({ visibility: 'PUBLIC' });
  const regionPhotos = toRegionPhotoMap(
    getTravelRecordRegionPhotoRecords(
      filterTravelMapFoldersByYear(mapQuery.folders, selectedYear)
    )
  );
  const mapReady = !mapQuery.isPending && !mapQuery.isError;
  const shareData = getTravelMapShareData(
    userId,
    profile?.name ?? '',
    window.location.origin
  );

  return (
    <TravelRecordShareDialog
      title="여행 지도 공유"
      onClose={onClose}
      isBusy={isBusy}
      externalShareAction={
        <TravelRecordExternalShareActions
          data={mapReady ? shareData : null}
          isBusy={isBusy}
          createKakaoImage={() => {
            if (!cardRef.current) throw new Error('Map unavailable');
            return createShareCardPng(cardRef.current, []);
          }}
          onBusyChange={setIsBusy}
        />
      }
    >
      <div ref={cardRef} className="flex flex-col items-center bg-[#f9f9f9]">
        <div
          inert
          aria-hidden="true"
          className="pointer-events-none h-[245px] w-[217px] shrink-0"
        >
          <Map
            baseScale={1.62}
            labelBaseScale={2.5}
            minZoom={0.8}
            initialZoom={0.9}
            regionPhotos={regionPhotos}
            showControls={false}
          />
        </div>
        <div className="bg-main-3 relative z-10 -mt-[60px] size-[49px] shrink-0 overflow-hidden rounded-full shadow-[0_-2px_10px_rgba(0,0,0,0.25)]">
          {profile?.profileImageUrl ? (
            <ProfileAvatar src={profile.profileImageUrl} size={49} />
          ) : (
            <img
              src={mapSharerIcon}
              alt=""
              aria-hidden="true"
              className="absolute top-[3px] left-[calc(50%+0.5px)] -translate-x-1/2"
            />
          )}
        </div>
        <p className="mt-2 max-w-full truncate text-center text-sm leading-[17px] font-semibold">
          {profile?.name || '사용자'}
        </p>
      </div>
    </TravelRecordShareDialog>
  );
}

export default TravelMapShareModal;
