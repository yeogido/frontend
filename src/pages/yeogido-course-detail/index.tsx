import { useParams } from 'react-router-dom';

import CourseMap from './components/CourseMap';
import CourseReviewSection from './components/CourseReviewSection';
import HeroSection from './components/HeroSection';
import InfoBadgesCard from './components/InfoBadgesCard';
import OverviewCard from './components/OverviewCard';
import TitleSection from './components/TitleSection';
import type { LocalCourse } from './types/course';
import ReviewButton from './components/ReviewButton';

// Mock data for local course
const courseImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';
const course: LocalCourse = {
  title: '제주 동쪽 마을 산책 코스',
  heroImageUrl: courseImage,
  liked: false,
  tags: [
    { id: 1, label: '골목', icon: 'magic', tone: 'primary' },
    { id: 2, label: '오름', icon: 'nature', tone: 'green' },
    { id: 3, label: '바다', icon: 'beach', tone: 'sky' },
    { id: 4, label: '로컬 맛집', icon: 'food', tone: 'neutral' },
    { id: 5, label: '사진 명소', icon: 'magic', tone: 'blue' },
  ],
  infoBadges: [
    { id: 1, label: '당일치기', icon: 'calendar' },
    { id: 2, label: '도보+버스', icon: 'bus' },
    { id: 3, label: '약 7시간', icon: 'calendar' },
    { id: 4, label: '친구와 함께', icon: 'people' },
  ],
  overview:
    '제주의 조용한 동쪽 마을을 천천히 걷는 하루 코스예요. 오름에서 아침 풍경을 감상하고, 세화의 작은 식당과 소품 숍을 지나 월정리 해변에서 노을까지 즐길 수 있어요.',
  stops: [
    {
      id: 1,
      order: 1,
      name: '아부오름',
      address: '제주특별자치도 제주시 구좌읍 금백조로 930',
      hours: '매일 00:00 - 24:00',
      image: courseImage,
      liked: false,
      transportToNext: '버스 약 35분',
    },
    {
      id: 2,
      order: 2,
      name: '세화민속오일시장',
      address: '제주특별자치도 제주시 구좌읍 세화리 1500-5',
      hours: '오일장 운영일 08:00 - 14:00',
      image: courseImage,
      liked: true,
      transportToNext: '버스 약 20분',
    },
    {
      id: 3,
      order: 3,
      name: '월정리 해변',
      address: '제주특별자치도 제주시 구좌읍 월정리 33-3',
      hours: '매일 00:00 - 24:00',
      image: courseImage,
      liked: false,
    },
  ],
  reviews: [
    {
      id: 1,
      profileImage: courseImage,
      nickname: '제주산책러',
      meta: '20대 · 친구',
      content:
        '아침 오름부터 저녁 바다까지 분위기가 계속 달라져서 지루하지 않았어요. 이동 시간도 적당하고 중간에 시장 구경하는 재미가 좋았습니다.',
      rating: 5,
    },
    {
      id: 2,
      profileImage: courseImage,
      nickname: '느린여행자',
      meta: '30대 · 커플',
      content:
        '렌터카 없이 다녀도 부담 없는 코스였어요. 세화에서 점심을 먹고 월정리 카페에서 쉬니 하루 일정으로 딱 좋았습니다.',
      rating: 4,
    },
  ],
};

function LocalCoursePage() {
  const { courseId } = useParams<{ courseId?: string }>();

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white pb-[104px]">
      <HeroSection
        imageUrl={course.heroImageUrl}
        title={course.title}
        initialLiked={course.liked}
      />

      <div className="space-y-4">
        <TitleSection title={course.title} tags={course.tags} />

        <InfoBadgesCard badges={course.infoBadges} />
        <OverviewCard overview={course.overview} />

        <CourseMap stops={course.stops} />
        <CourseReviewSection reviews={course.reviews} />
        <ReviewButton courseId={courseId} />
      </div>
    </div>
  );
}

export default LocalCoursePage;
