import { useLocation } from 'react-router-dom';

import { KakaoIcon } from '../../../../components/auth';
import Responsive from '../../../../components/layout/Responsive';
import SocialProfileForm from '../components/SocialProfileForm';
import SocialProfileDesktopForm from '../desktop/SocialProfileDesktopForm';

interface KakaoSignupLocationState {
  temporaryToken?: string;
  name?: string;
}

function KakaoSignupPage() {
  const location = useLocation();
  const locationState = location.state as KakaoSignupLocationState | null;

  const profileProps = {
    providerLabel: '카카오',
    badgeClassName: 'bg-[#FEE500] text-black',
    Icon: KakaoIcon,
    temporaryToken: locationState?.temporaryToken,
    defaultName: locationState?.name,
  };

  return (
    <Responsive
      desktop={<SocialProfileDesktopForm {...profileProps} />}
      mobile={<SocialProfileForm {...profileProps} />}
    />
  );
}

export default KakaoSignupPage;
