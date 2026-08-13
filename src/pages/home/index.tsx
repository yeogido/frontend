import { useState } from 'react';

import {
  AdvertisementSection,
  CourseSection,
  FestivalSection,
  MapSection,
  OnboardingModal,
  ReviewSection,
} from './components';
import { hasSeenOnboarding } from '../../utils/onboarding';

function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !hasSeenOnboarding()
  );

  return (
    <>
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
      <MapSection />
      <FestivalSection />
      <CourseSection />
      <ReviewSection />
      <AdvertisementSection />
    </>
  );
}

export default HomePage;
