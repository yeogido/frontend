import { useLocation } from 'react-router-dom';

import ProfilePage from '..';
import type { BusinessProfile } from '../../business-verification/types';

interface BusinessPreviewLocationState {
  readonly profile?: BusinessProfile;
}

function BusinessProfilePreviewPage() {
  const location = useLocation();
  const state = location.state as BusinessPreviewLocationState | null;

  // 인증 응답은 role/businessInfoId만 주고, 사업장 목록 응답에는 개업일자가
  // 없다. 그래서 인증 화면이 방금 제출한 값을 넘겨준다. 이 경로로 직접
  // 들어오면 state가 없고, 그때는 프로필 화면이 목록 조회로 채운다.
  return <ProfilePage businessProfileOverride={state?.profile ?? null} />;
}

export default BusinessProfilePreviewPage;
