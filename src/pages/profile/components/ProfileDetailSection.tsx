import type { BusinessInfoResponse } from '../../../types/business.type';
import { BusinessPlaceList } from './BusinessPlaceList';
import { BusinessVerificationCard } from './BusinessVerificationCard';
import { ProfileInfoList } from './ProfileInfoList';

interface ProfileDetailSectionProps {
  readonly businesses: readonly BusinessInfoResponse[];
  readonly role?: string;
  readonly email: string;
  readonly region: string;
  readonly birthYear: string;
  readonly scale: number;
}

export function ProfileDetailSection({
  businesses,
  role,
  email,
  region,
  birthYear,
  scale,
}: ProfileDetailSectionProps) {
  const isBusinessProfile = businesses.length > 0;

  return (
    <>
      <div className="w-full" style={{ marginTop: 24 * scale }}>
        <ProfileInfoList
          scale={scale}
          email={email}
          region={region}
          birthYear={birthYear}
          isBusinessProfile={isBusinessProfile}
        />
      </div>
      <div className="w-full" style={{ marginTop: 24 * scale }}>
        {isBusinessProfile ? (
          <BusinessPlaceList businesses={businesses} scale={scale} />
        ) : role === 'USER' ? (
          <BusinessVerificationCard scale={scale} />
        ) : null}
      </div>
    </>
  );
}