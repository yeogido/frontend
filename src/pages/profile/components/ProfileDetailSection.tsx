import type { BusinessInfoResponse } from '../../../types/business.type';
import type { BusinessProfile } from '../../business-verification/types';
import { BusinessPlaceList } from './BusinessPlaceList';
import { BusinessVerificationCard } from './BusinessVerificationCard';
import { ProfileInfoList } from './ProfileInfoList';

interface ProfileDetailSectionProps {
  readonly businessProfile: BusinessProfile | null;
  readonly businesses: readonly BusinessInfoResponse[];
  readonly scale: number;
}

export function ProfileDetailSection({
  businessProfile,
  businesses,
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
        {businesses.length > 0 ? (
          <BusinessPlaceList businesses={businesses} scale={scale} />
        ) : (
          <BusinessVerificationCard scale={scale} />
        )}
      </div>
    </>
  );
}
