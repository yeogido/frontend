import CourseMap from './components/CourseMap';
import CourseReviewSection from './components/CourseReviewSection';
import HeroSection from './components/HeroSection';
import InfoBadgesCard from './components/InfoBadgesCard';
import OverviewCard from './components/OverviewCard';
import TitleSection from './components/TitleSection';
import type { LocalCourse } from './types/course';
import ReviewButton from './components/ReviewButton';

// Mock data for local course
const courseImage = '../src/assets/icons/yeogido.svg';
const course: LocalCourse = {
  title: '강릉 혼자 여행 코스',
  heroImageUrl: courseImage,
  tags: [
    { id: 1, label: '여름', icon: 'beach', tone: 'primary' },
    { id: 2, label: '자연', icon: 'nature', tone: 'green' },
    { id: 3, label: '바다', icon: 'beach', tone: 'sky' },
    { id: 4, label: '카페', icon: 'food', tone: 'neutral' },
    { id: 5, label: '체험', icon: 'magic', tone: 'blue' },
  ],
  infoBadges: [
    { id: 1, label: '2박 3일', icon: 'calendar' },
    { id: 2, label: '뚜벅이 코스', icon: 'walk' },
    { id: 3, label: '4월 - 10월', icon: 'calendar' },
    { id: 4, label: '혼자', icon: 'solo' },
  ],
  overview:
    '바다를 따라 걷고, 감성 가득한 카페와 로컬 맛집을 즐기는 강릉의 매력을 천천히 느끼는 2박 3일 코스입니다.',
  stops: [
    {
      id: 1,
      order: 1,
      name: '주문진 해변',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      transportToNext: '도보 약 30분',
    },
    {
      id: 2,
      order: 2,
      name: '주문진 해변',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      transportToNext: '도보 약 30분',
    },
    {
      id: 3,
      order: 3,
      name: '주문진 해변',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      transportToNext: '도보 약 30분',
    },
  ],
  reviews: [
    {
      id: 1,
      profileImage: courseImage,
      nickname: '민지',
      meta: '20대 여',
      content:
        '지도 동선이 너무 편했어요. 전시 포인트마다 사진 각이 딱 잡혔고, 야경까지 흐름이 좋아서 만족!',
      rating: 5,
    },
    {
      id: 2,
      profileImage: courseImage,
      nickname: '민지',
      meta: '20대 여',
      content:
        '지도 동선이 너무 편했어요. 포인트마다 사진 각이 딱 잡혔고, 마지막까지 흐름이 좋아서 만족!',
      rating: 5,
    },
  ],
};

function LocalCoursePage() {
  return (
    <div className="mx-auto min-h-screen w-full bg-white pb-6 sm:pb-8 lg:overflow-hidden lg:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <HeroSection imageUrl={course.heroImageUrl} title={course.title} />

      <div className="space-y-4 sm:space-y-5 lg:space-y-8 lg:py-2">
        <TitleSection title={course.title} tags={course.tags} />

        <OverviewCard overview={course.overview} />
        <InfoBadgesCard badges={course.infoBadges} />

        <CourseMap stops={course.stops} />
        <CourseReviewSection reviews={course.reviews} />
        <ReviewButton />
      </div>
    </div>
  );
}

export default LocalCoursePage;
