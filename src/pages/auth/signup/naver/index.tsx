import { useLocation } from 'react-router-dom';

import { NaverIcon } from '../../../../components/auth';
import Responsive from '../../../../components/layout/Responsive';
import SocialProfileForm from '../components/SocialProfileForm';
import SocialProfileDesktopForm from '../desktop/SocialProfileDesktopForm';

interface NaverSignupLocationState {
  temporaryToken?: string;
  name?: string;
}

function NaverSignupPage() {
  const location = useLocation();
  const locationState = location.state as NaverSignupLocationState | null;

  const profileProps = {
    providerLabel: '네이버',
    badgeClassName: 'bg-[#03C75A] text-white',
    Icon: NaverIcon,
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

export default NaverSignupPage;
