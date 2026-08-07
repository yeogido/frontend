import type { BusinessProfile } from '../../business-verification/types';
import { BusinessPlaceList } from './BusinessPlaceList';
import { BusinessVerificationCard } from './BusinessVerificationCard';
import { ProfileInfoList } from './ProfileInfoList';

interface ProfileDetailSectionProps {
  readonly businessProfile: BusinessProfile | null;
  readonly scale: number;
}

export function ProfileDetailSection({
  businessProfile,
  scale,
}: ProfileDetailSectionProps) {
  return (
    <>
      <div className="w-full" style={{ marginTop: 24 * scale }}>
        <ProfileInfoList
          scale={scale}
          isBusinessProfile={Boolean(businessProfile)}
          businessAddress={businessProfile?.businessAddress}
        />
      </div>
      <div className="w-full" style={{ marginTop: 24 * scale }}>
        {businessProfile ? (
          <BusinessPlaceList profile={businessProfile} scale={scale} />
        ) : (
          <BusinessVerificationCard scale={scale} />
        )}
      </div>
    </>
  );
}
