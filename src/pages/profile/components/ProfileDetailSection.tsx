import type { BusinessProfile } from '../../business-verification/types';
import type { UserRole } from '../../../types/user.type';
import { BusinessPlaceList } from './BusinessPlaceList';
import { BusinessVerificationCard } from './BusinessVerificationCard';
import { ProfileInfoList } from './ProfileInfoList';

interface ProfileDetailSectionProps {
  readonly businessProfile: BusinessProfile | null;
  readonly role?: UserRole;
  readonly email: string;
  readonly region: string;
  readonly birthYear: string;
  readonly scale: number;
}

export function ProfileDetailSection({
  businessProfile,
  role,
  email,
  region,
  birthYear,
  scale,
}: ProfileDetailSectionProps) {
  return (
    <>
      <div className="w-full" style={{ marginTop: 24 * scale }}>
        <ProfileInfoList
          scale={scale}
          email={email}
          region={region}
          birthYear={birthYear}
          isBusinessProfile={Boolean(businessProfile)}
          businessAddress={businessProfile?.businessAddress}
        />
      </div>
      <div className="w-full" style={{ marginTop: 24 * scale }}>
        {businessProfile ? (
          <BusinessPlaceList profile={businessProfile} scale={scale} />
        ) : role === 'USER' ? (
          <BusinessVerificationCard scale={scale} />
        ) : null}
      </div>
    </>
  );
}
