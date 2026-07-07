import {
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
    </>
  );
}

export default HomePage;