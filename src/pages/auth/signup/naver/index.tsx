import { useLocation } from 'react-router-dom';

import { NaverIcon } from '../../../../components/auth';
import SocialProfileForm from '../components/SocialProfileForm';

interface NaverSignupLocationState {
  temporaryToken?: string;
  name?: string;
}

function NaverSignupPage() {
  const location = useLocation();
  const locationState = location.state as NaverSignupLocationState | null;

  return (
    <SocialProfileForm
      providerLabel="네이버"
      badgeClassName="bg-[#03C75A] text-white"
      Icon={NaverIcon}
      temporaryToken={locationState?.temporaryToken}
      defaultName={locationState?.name}
    />
  );
}

export default NaverSignupPage;
