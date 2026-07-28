import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  DetailDescriptionCard,
  DetailHeroSection,
  DetailInfoCard,
  DetailPlaceCard,
  DetailTitleSection,
  FavoriteButton,
  ShareButton,
} from '../components';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';
import BaseKakaoMap from '../../../components/kakaomap/BaseKakaoMap';
import CourseCard from '../../../components/common/CourseCard';
import SectionHeader from '../../../components/common/SectionHeader';

import {
  mapFestivalDetailDtoToViewModel,
  toSafeExternalUrl,
  toTelHref,
} from '../mappers/festivalDetailMapper';
import type { FestivalDetail } from '../types/festivalDetail';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { getGutter } from '../../../utils/responsiveLayout';
import { buildCourseSearchPath } from '../../../utils/routes';
import watermelonFestivalImage from '../../festival/assets/watermelon-festival.webp';

// Figma 390 디자인 기준 리터럴 px ("여기도 추천 행사 상세뷰" 시안, 캔버스 390x1514)
const PAGE_PADDING_BOTTOM = 32;
const TITLE_SECTION_PADDING_TOP = 15;
const TOAST_BOTTOM = 84;
const TOAST_TEXT_PADDING_X = 16;
const TOAST_TEXT_PADDING_Y = 8;
const TOAST_TEXT_FONT_SIZE = 13;
const SECTION_MARGIN_TOP = 16;
const INFO_CARD_MARGIN_TOP = 24;
const MAP_MARGIN_TOP = 24;
// 시안: 지도 하단 1114 → 장소 썸네일 상단 1130 (16). DetailPlaceCard 자체 상단 패딩 12를 뺀 값.
const PLACE_CARD_MARGIN_TOP = 4;
const COURSE_SECTION_MARGIN_TOP = 12;
const COURSE_LIST_MARGIN_TOP = 24;
const COURSE_CARD_GAP = 16;
const MAP_FALLBACK_HEIGHT = 342;
const MAP_FALLBACK_RADIUS = 12;
const MAP_FALLBACK_FONT_SIZE = 14;

// Mock data (시안 "양평수박축제" 기준).
// 축제 상세 API가 아직 없어 화면 검증용 DTO를 그대로 매퍼에 통과시킨다.
const rawMockDto = {
  id: 1,
  title: '양평수박축제',
  heroImageUrl: watermelonFestivalImage,
  liked: false,
  tags: [
    { id: 1, tagId: 'summer' as const, label: '여름' },
    { id: 2, tagId: 'nature' as const, label: '자연' },
    { id: 3, tagId: 'experience' as const, label: '체험' },
    { id: 4, tagId: 'event' as const, label: '행사' },
  ],
  overview:
    '올해 두 번째로 개최되는 양평수박축제는 달콤한 수박, 시원한 물놀이, 건강한 농특산물을 주제로, 청운면의 대표 특산물로 자리매김한 양평수박의 우수성을 널리 알리고 가족 단위 관광객이 함께 즐길 수 있는 여름 축제로 기획되었다. 양평수박은 깨끗한 자연환경과 풍부한 일조량, 큰 일교차 속에서 재배되어 높은 당도와 아삭한 식감을 자랑하며, 매년 소비자들에게 큰 사랑을 받고 있다. 특히 이번 축제에서는 양평수박을 활용한 다양한 먹거리와 체험 프로그램, 수박 이벤트 등을 통해 방문객들이 양평수박의 매력을 오감으로 즐길 수 있도록 구성하였으며, 어린이를 위한 시원한 물놀이시설과 가족 참여형 프로그램도 함께 마련하여 남녀노소 누구나 즐길 수 있는 여름 대표 축제의 장을 선보일 예정이다.',
  address: '경기도 양평군 청운면 용두민속장터길 2',
  period: '2026.07.04 ~ 2026.07.05',
  phone: '0507-1470-1661',
  homepageUrl: 'https://www.yp21.go.kr',
  homepageLabel: '공식홈페이지',
  place: {
    id: 1,
    name: '청운용두시장',
    address: '경기 양평군 청운면 용두민속장터길 2',
    hours: '평일 10:00 - 24:00',
    image: watermelonFestivalImage,
    liked: false,
    latitude: 37.4562,
    longitude: 127.687,
  },
  relatedCourses: [
    {
      id: 1,
      image: watermelonFestivalImage,
      title: '강릉 혼자 여행 코스',
      duration: '2박 3일',
      courseType: '뚜벅이',
      companion: '혼자',
      tags: ['summer', 'nature', 'sea'] as const,
      liked: false,
    },
    {
      id: 2,
      image: watermelonFestivalImage,
      title: '강릉 혼자 여행 코스',
      duration: '2박 3일',
      courseType: '뚜벅이',
      companion: '혼자',
      tags: ['summer', 'nature', 'sea'] as const,
      liked: false,
    },
  ],
};

function FestivalDetailContent({ festivalId }: { festivalId?: string }) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();

  // 1. DTO Mapper를 통한 데이터 및 런타임 에러 검증
  const { festival, error } = useMemo<{
    festival: FestivalDetail | null;
    error: string | null;
  }>(() => {
    try {
      return {
        festival: mapFestivalDetailDtoToViewModel(
          rawMockDto,
          festivalId ?? '1'
        ),
        error: null,
      };
    } catch (e) {
      return {
        festival: null,
        error:
          e instanceof Error ? e.message : '행사 정보를 불러오지 못했습니다.',
      };
    }
  }, [festivalId]);

  // 2. Page Level 좋아요 및 공유/토스트 State
  const [isLiked, setIsLiked] = useState(festival?.liked ?? false);
  const [isPlaceLiked, setIsPlaceLiked] = useState(
    festival?.place.liked ?? false
  );
  const [likedCourseIds, setLikedCourseIds] = useState<readonly number[]>([]);
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

  const runAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    action();
  };

  const handleFavoriteToggle = () => {
    runAuthAction(() => setIsLiked((prev) => !prev));
  };

  const handlePlaceLikeToggle = () => {
    runAuthAction(() => setIsPlaceLiked((prev) => !prev));
  };

  const handleCourseLikeToggle = (courseId: number) => {
    runAuthAction(() => {
      setLikedCourseIds((prev) =>
        prev.includes(courseId)
          ? prev.filter((id) => id !== courseId)
          : [...prev, courseId]
      );
    });
  };

  if (error) {
    return (
      <ResponsivePageShell mode="main-layout" className="text-red-500">
        <div
          role="alert"
          className="flex flex-1 items-center justify-center text-center"
        >
          {error}
        </div>
      </ResponsivePageShell>
    );
  }

  if (!festival) {
    return (
      <ResponsivePageShell mode="standalone" className="text-gray-4">
        <div
          role="status"
          className="flex flex-1 items-center justify-center text-center"
        >
          불러오는 중...
        </div>
      </ResponsivePageShell>
    );
  }

  const mapCenter = festival.place.location;

  return (
    <ResponsivePageShell
      mode="main-layout"
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      {/* 1. 히어로 영역 (우측 상단 좋아요 버튼 슬롯) */}
      <ResponsiveFullBleed>
        <DetailHeroSection
          imageUrl={festival.heroImageUrl}
          title={festival.title}
          rightAction={
            <FavoriteButton
              isActive={isLiked}
              label={festival.title}
              onClick={handleFavoriteToggle}
            />
          }
        />
      </ResponsiveFullBleed>

      {/* 2. 제목 + 공유 버튼, 3. 카테고리 칩 */}
      <div style={{ paddingTop: TITLE_SECTION_PADDING_TOP * scale }}>
        <DetailTitleSection
          title={festival.title}
          tags={festival.tags}
          action={
            <ShareButton
              onClick={handleShare}
              label={`${festival.title} 공유하기`}
            />
          }
        />
      </div>

      {copied && (
        <div
          className="pointer-events-none fixed bottom-0 left-1/2 z-[60] flex w-full max-w-[500px] -translate-x-1/2 justify-center"
          style={{
            bottom: `max(${TOAST_BOTTOM * scale}px, env(safe-area-inset-bottom, 0px))`,
            paddingLeft: getGutter(scale),
            paddingRight: getGutter(scale),
          }}
        >
          <span
            role="status"
            className={`bg-gray-800 text-center font-medium text-white shadow-lg transition-all duration-300 ${
              isToastVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              paddingLeft: TOAST_TEXT_PADDING_X * scale,
              paddingRight: TOAST_TEXT_PADDING_X * scale,
              paddingTop: TOAST_TEXT_PADDING_Y * scale,
              paddingBottom: TOAST_TEXT_PADDING_Y * scale,
              fontSize: TOAST_TEXT_FONT_SIZE * scale,
              borderRadius: 999 * scale,
            }}
          >
            복사 됨
          </span>
        </div>
      )}

      {/* 4. 행사 소개 */}
      <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <DetailDescriptionCard title="행사 소개" content={festival.overview} />
      </section>

      {/* 5. 행사 기본 정보 (주소 / 기간 / 전화번호 / 공식홈페이지) */}
      <section style={{ marginTop: INFO_CARD_MARGIN_TOP * scale }}>
        <DetailInfoCard
          address={festival.address}
          hours={festival.period}
          phone={festival.phone}
          website={festival.homepageLabel}
          phoneHref={toTelHref(festival.phone)}
          websiteHref={toSafeExternalUrl(festival.homepageUrl)}
        />
      </section>

      {/* 6. 지도 */}
      <div style={{ marginTop: MAP_MARGIN_TOP * scale }}>
        {mapCenter ? (
          <BaseKakaoMap center={mapCenter} markers={[mapCenter]} />
        ) : (
          <div
            role="status"
            className="bg-gray-2 text-gray-4 flex w-full items-center justify-center"
            style={{
              height: MAP_FALLBACK_HEIGHT * scale,
              borderRadius: MAP_FALLBACK_RADIUS * scale,
              fontSize: MAP_FALLBACK_FONT_SIZE * scale,
            }}
          >
            등록된 행사 위치 정보가 없습니다.
          </div>
        )}
      </div>

      {/* 7. 행사 장소 카드 */}
      <div style={{ marginTop: PLACE_CARD_MARGIN_TOP * scale }}>
        <DetailPlaceCard
          imageUrl={festival.place.image}
          title={festival.place.name}
          address={festival.place.address}
          hours={festival.place.hours}
          liked={isPlaceLiked}
          onLikeClick={handlePlaceLikeToggle}
        />
      </div>

      {/* 8. 이 행사가 포함된 코스 */}
      <div style={{ marginTop: COURSE_SECTION_MARGIN_TOP * scale }}>
        <SectionHeader
          title="이 행사가 포함된 코스"
          actionText="전체보기"
          onActionClick={() =>
            navigate(buildCourseSearchPath(festival.place.name))
          }
        />
      </div>

      <div
        className="flex flex-col"
        style={{
          marginTop: COURSE_LIST_MARGIN_TOP * scale,
          gap: COURSE_CARD_GAP * scale,
        }}
      >
        {festival.relatedCourses.map((course) => (
          <CourseCard
            key={course.id}
            image={course.image}
            title={course.title}
            duration={course.duration}
            courseType={course.courseType}
            companion={course.companion}
            tags={[...course.tags]}
            liked={likedCourseIds.includes(course.id)}
            onClick={() => navigate(`/yeogido-course/detail/${course.id}`)}
            onLikeClick={() => handleCourseLikeToggle(course.id)}
          />
        ))}
      </div>
    </ResponsivePageShell>
  );
}

/**
 * 라우트 파라미터만 바뀌면 리액트 라우터가 컴포넌트를 언마운트하지 않으므로,
 * key 로 강제 리마운트해 좋아요/토스트 상태가 이전 행사에 남지 않게 한다.
 */
function FestivalDetailPage() {
  const { festivalId } = useParams<{ festivalId?: string }>();

  return (
    <FestivalDetailContent key={festivalId ?? '1'} festivalId={festivalId} />
  );
}

export default FestivalDetailPage;
