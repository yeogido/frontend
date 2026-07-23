import {
  AdvertisementSection,
  CourseSection,
  FestivalSection,
  MapSection,
  ReviewSection,
} from './components';

function HomePage() {
  return (
    <>
      <MapSection />
      <FestivalSection />
      <CourseSection />
      <ReviewSection />
      <AdvertisementSection />
    </>
  );
}

export default HomePage;