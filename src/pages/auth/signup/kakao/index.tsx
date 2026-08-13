import { useLocation } from 'react-router-dom';

import { KakaoIcon } from '../../../../components/auth';
import SocialProfileForm from '../components/SocialProfileForm';

interface KakaoSignupLocationState {
  temporaryToken?: string;
  name?: string;
}

function KakaoSignupPage() {
  const location = useLocation();
  const locationState = location.state as KakaoSignupLocationState | null;

  return (
    <SocialProfileForm
      providerLabel="카카오"
      badgeClassName="bg-[#FEE500] text-black"
      Icon={KakaoIcon}
      temporaryToken={locationState?.temporaryToken}
      defaultName={locationState?.name}
    />
  );
}

export default KakaoSignupPage;
