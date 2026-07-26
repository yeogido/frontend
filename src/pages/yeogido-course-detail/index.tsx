import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DetailHeroSection } from '../../components/detail/DetailHeroSection';
import { DetailTitleSection } from '../../components/detail/DetailTitleSection';
import { DetailDescriptionCard } from '../../components/detail/DetailDescriptionCard';
import { ReviewButton } from '../../components/detail/ReviewButton';

import { CourseInfoBadgesCard } from '../../features/course-detail/components/CourseInfoBadgesCard';
import { CourseRouteMap } from '../../features/course-detail/components/CourseRouteMap';
import { CourseStopList } from '../../features/course-detail/components/CourseStopList';
import CourseReviewSection from './components/CourseReviewSection';
import FavoriteButton from './components/FavoriteButton';
import ShareButton from './components/ShareButton';

import { mapCourseDetailDtoToViewModel } from '../../features/course-detail/mappers/courseDetailMapper';
import type { CourseDetail } from '../../features/course-detail/types/courseDetail';

// Mock data (시안 이미지 기준 "강릉 혼자 여행 코스" 데이터)
const courseImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';

const rawMockDto = {
  id: 1,
  title: '강릉 혼자 여행 코스',
  heroImageUrl: courseImage,
  liked: false,
  tags: [
    { id: 1, tagId: 'summer' as const, label: '여름' },
    { id: 2, tagId: 'nature' as const, label: '자연' },
    { id: 3, tagId: 'sea' as const, label: '바다' },
    { id: 4, tagId: 'cafe' as const, label: '카페' },
    { id: 5, tagId: 'experience' as const, label: '체험' },
  ],
  infoBadges: [
    { id: 1, label: '2박 3일', icon: 'calendar' as const },
    { id: 2, label: '뚜벅이 코스', icon: 'walk' as const },
    { id: 3, label: '4월 - 10월', icon: 'calendar' as const },
    { id: 4, label: '혼자', icon: 'solo' as const },
  ],
  overview:
    '바다를 따라 걷고, 감성 가득한 카페와 로컬 맛집을 즐기는\n강릉의 매력을 천천히 느끼는 2박 3일 코스입니다.',
  stops: [
    {
      id: 1,
      order: 1,
      name: '주문진 해변',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      liked: false,
      latitude: 37.8911,
      longitude: 128.8277,
      transportToNext: '도보 약 30분',
    },
    {
      id: 2,
      order: 2,
      name: '강릉 중앙시장',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      liked: false,
      latitude: 37.7538,
      longitude: 128.8986,
      transportToNext: '버스 약 30분',
    },
    {
      id: 3,
      order: 3,
      name: '초당 순두부마을',
      address: '강원특별자치도 강릉시 창해로14번길 28',
      hours: '평일 10:00 - 23:00',
      image: courseImage,
      liked: false,
      latitude: 37.7905,
      longitude: 128.9145,
      transportToNext: '버스 약 30분',
    },
  ],
  reviews: [
    {
      id: 1,
      images: ['', '', ''],
      profileImage: courseImage,
      nickname: '민지',
      meta: '20대 여',
      content:
        '지도 동선이 너무 편했어요. 전시 포인트마다 사진 각이 딱 잡혔고, 야경까지 흐름이 좋아서 만족!',
      rating: 5,
    },
    {
      id: 2,
      images: ['', ''],
      profileImage: courseImage,
      nickname: '느린여행자',
      meta: '30대 남',
      content:
        '렌터카 없이 다녀도 부담 없는 코스였어요. 초당에서 점심 먹고 월정리 카페에서 쉬니 딱 좋았습니다.',
      rating: 5,
    },
  ],
};

function YeogidoCourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();

  // 1. DTO Mapper를 통한 데이터 및 런타임 에러 검증
  const { course, error } = useMemo<{
    course: CourseDetail | null;
    error: string | null;
  }>(() => {
    try {
      return {
        course: mapCourseDetailDtoToViewModel(rawMockDto, courseId ?? '1'),
        error: null,
      };
    } catch (e) {
      return {
        course: null,
        error:
          e instanceof Error ? e.message : '코스 정보를 불러오지 못했습니다.',
      };
    }
  }, [courseId]);

  // 2. Page Level 좋아요 및 공유/토스트 State
  const [isLiked, setIsLiked] = useState(course?.liked ?? false);
  const [copied, setCopied] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setIsToastVisible(true);
      fadeTimerRef.current = setTimeout(() => setIsToastVisible(false), 1600);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleNavigateReview = () => {
    const currentId = courseId ?? course?.id ?? 1;
    navigate(`/review?type=yeogido-course&id=${currentId}`);
  };

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center p-5 text-center text-red-500"
      >
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div
        role="status"
        className="text-gray-4 mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center p-5 text-center"
      >
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white pb-11">
      {/* 1. 히어로 세션 (우측 상단 좋아요 버튼 슬롯) */}
      <DetailHeroSection
        imageUrl={course.heroImageUrl}
        title={course.title}
        rightAction={
          <FavoriteButton
            isActive={isLiked}
            label={course.title}
            onClick={() => setIsLiked((prev) => !prev)}
          />
        }
      />

      {/* 2. 타이틀 세션 (우측 공유 버튼 슬롯) */}
      <DetailTitleSection
        className="px-5 pt-[27px] pb-0"
        title={course.title}
        tags={course.tags}
        action={<ShareButton onClick={handleShare} />}
      />

      {copied && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-[60] mx-auto flex w-full max-w-[430px] justify-center px-5">
          <span
            role="status"
            className={`rounded-full bg-gray-800 px-4 py-2 text-center text-[13px] font-medium text-white shadow-lg transition-all duration-300 ${
              isToastVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            복사 됨
          </span>
        </div>
      )}

      {/* 3. 코스 메타 배지 */}
      <section className="mt-4 px-5">
        <CourseInfoBadgesCard badges={course.infoBadges} />
      </section>

      {/* 4. 코스 소개 카드 */}
      <section className="mt-4 px-5">
        <DetailDescriptionCard title="코스 소개" content={course.overview} />
      </section>

      {/* 5. 코스 지도 */}
      <CourseRouteMap stops={course.stops} className="mt-[26px] px-5" />

      {/* 6. 코스 장소 리스트 */}
      <CourseStopList stops={course.stops} className="mt-5 px-5" />

      {/* 7. 최근 여행자들의 후기 */}
      <CourseReviewSection reviews={course.reviews} className="mt-[42px]" />

      {/* 8. 하단 고정 리뷰 작성 버튼 */}
      <ReviewButton className="mt-6 px-5" onClick={handleNavigateReview} />
    </div>
  );
}

export default YeogidoCourseDetailPage;
