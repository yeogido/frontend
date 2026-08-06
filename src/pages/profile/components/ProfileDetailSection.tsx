import type { BusinessInfoResponse } from '../../../types/business.type';
import { BusinessPlaceList } from './BusinessPlaceList';
import { BusinessVerificationCard } from './BusinessVerificationCard';
import { ProfileInfoList } from './ProfileInfoList';

interface ProfileDetailSectionProps {
  readonly businesses: readonly BusinessInfoResponse[];
  readonly scale: number;
}

export function ProfileDetailSection({
  businesses,
  scale,
}: ProfileDetailSectionProps) {
  const isBusinessProfile = businesses.length > 0;

  return (
    <>
      <div className="w-full" style={{ marginTop: 24 * scale }}>
        <ProfileInfoList
          scale={scale}
          isBusinessProfile={isBusinessProfile}
          businessAddress={businesses[0]?.businessAddress}
        />
      </div>
      <div className="w-full" style={{ marginTop: 24 * scale }}>
        {isBusinessProfile ? (
          <BusinessPlaceList businesses={businesses} scale={scale} />
        ) : (
          <BusinessVerificationCard scale={scale} />
        )}
      </div>
    </>
  );
}
