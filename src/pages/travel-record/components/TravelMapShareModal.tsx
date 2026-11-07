import ProfileAvatar from '../../../components/common/ProfileAvatar';
import mapSharerIcon from '../../../assets/icons/share/map-sharer.svg';
import { useMyProfile } from '../../../hooks/useMyProfile';
import { mockTravelRecordShareFriends } from '../../../mocks/travelRecordShareFriends';
import Map from '../../home/map/components/Map';
import type { RegionPhotoMap } from '../../home/map/types/regionPhoto';
import TravelRecordShareDialog from './TravelRecordShareDialog';

interface TravelMapShareModalProps {
  regionPhotos: RegionPhotoMap;
  onClose: () => void;
}

function TravelMapShareModal({
  regionPhotos,
  onClose,
}: TravelMapShareModalProps) {
  const { data: profile } = useMyProfile();

  return (
    <TravelRecordShareDialog
      title="여행 지도 공유"
      friends={mockTravelRecordShareFriends}
      onClose={onClose}
    >
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
    </TravelRecordShareDialog>
  );
}

export default TravelMapShareModal;
