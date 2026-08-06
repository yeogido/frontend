import ProfilePage from '..';
import type { BusinessProfile } from '../../business-verification/types';

const businessProfilePreview: BusinessProfile = {
  businessName: '광안리해수욕장',
  businessAddress: '부산 수영구 광안해변로 219',
  representativeName: '김여기도',
  registrationNumber: '123-45-67890',
  openedAt: '2024-05-01',
};

function BusinessProfilePreviewPage() {
  return <ProfilePage businessProfileOverride={businessProfilePreview} />;
}

export default BusinessProfilePreviewPage;
