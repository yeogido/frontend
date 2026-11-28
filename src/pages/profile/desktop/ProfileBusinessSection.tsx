import { useMyBusinesses } from '../../../hooks/useMyBusinesses';
import { useMyProfile } from '../../../hooks/useMyProfile';
import { getProfileBusinessSection } from '../utils/profileBusinessSection';
import BusinessVerificationBanner from './BusinessVerificationBanner';
import MyBusinessesCard from './MyBusinessesCard';

/**
 * 데스크톱 프로필의 소상공인 영역 — 인증 배너 또는 "내 사업장" 카드. 모바일과 같은
 * 훅을 쓰므로 캐시를 공유하고, 인증에 성공하면 사업장·프로필 무효화로 배너가 카드로
 * 바뀐다. 보일 것이 없으면 아무것도 그리지 않는다.
 */
function ProfileBusinessSection() {
  const { data: profile } = useMyProfile();
  const { data, isLoading, isError } = useMyBusinesses();
  const businesses = data ?? [];
  const kind = getProfileBusinessSection({
    role: profile?.role,
    businessCount: businesses.length,
    isLoading,
    isError,
  });

  if (kind === 'none') return null;

  // 셸이 프로필 요약과 이 영역 사이에 32px을 두는데 시안은 24px이라 8px 당긴다.
  return (
    <div className="-mt-[8px]">
      {kind === 'card' ? (
        <MyBusinessesCard businesses={businesses} />
      ) : (
        <BusinessVerificationBanner />
      )}
    </div>
  );
}

export default ProfileBusinessSection;
