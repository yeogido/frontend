import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CourseInfoBadgesCard } from './CourseInfoBadgesCard';
import { CourseRouteMap } from './CourseRouteMap';
import { CourseStopList } from './CourseStopList';
import { DetailDescriptionCard } from './DetailDescriptionCard';
import { DetailHeroSection } from './DetailHeroSection';
import { DetailReviewSection } from './DetailReviewSection';
import { DetailTitleSection } from './DetailTitleSection';
import { FavoriteButton } from './FavoriteButton';
import { ReviewButton } from './ReviewButton';
import { ShareButton } from './ShareButton';
import { ShareToast } from './ShareToast';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';

import type { CourseDetail, CourseStop } from '../types/courseDetail';
import { useShareToast } from '../hooks/useShareToast';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_BOTTOM = 25;
const TITLE_SECTION_PADDING_TOP = 15;
const SECTION_MARGIN_TOP = 16;
const MAP_MARGIN_TOP = 24;
const STOP_LIST_MARGIN_TOP = 0;
const REVIEW_MARGIN_TOP = 24;
const REVIEW_BUTTON_MARGIN_TOP = 12;

export interface CourseDetailLayoutProps {
  readonly course: CourseDetail;
  readonly reviewType: string;
}

export function CourseDetailLayout({
  course,
  reviewType,
}: CourseDetailLayoutProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();

  const [isLiked, setIsLiked] = useState(course.liked);
  const [stops, setStops] = useState<readonly CourseStop[]>(course.stops);
  const { copied, isToastVisible, handleShare } = useShareToast();

  const handleStopLikeToggle = (stopId: number) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setStops((prevStops) =>
      prevStops.map((stop) =>
        stop.id === stopId ? { ...stop, liked: !stop.liked } : stop
      )
    );
  };

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setIsLiked((previous) => !previous);
  };

  const handleNavigateReview = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    navigate(`/review?type=${reviewType}&id=${course.id}`);
  };

  return (
    <ResponsivePageShell
      key={course.id}
      mode="main-layout"
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-white"
    >
      {/* 1. 히어로 세션 (우측 상단 좋아요 버튼 슬롯) */}
      <ResponsiveFullBleed>
        <DetailHeroSection
          imageUrl={course.heroImageUrl}
          title={course.title}
          rightAction={
            <FavoriteButton
              isActive={isLiked}
              label={course.title}
              onClick={handleFavoriteToggle}
            />
          }
        />
      </ResponsiveFullBleed>

      {/* 2. 타이틀 세션 (우측 공유 버튼 슬롯) */}
      <div
        style={{
          paddingTop: TITLE_SECTION_PADDING_TOP * scale,
        }}
      >
        <DetailTitleSection
          title={course.title}
          tags={course.tags}
          action={<ShareButton onClick={handleShare} />}
        />
      </div>

      <ShareToast copied={copied} isToastVisible={isToastVisible} />

      {/* 3. 코스 메타 배지 */}
      <section
        style={{
          marginTop: SECTION_MARGIN_TOP * scale,
        }}
      >
        <CourseInfoBadgesCard badges={course.infoBadges} />
      </section>

      {/* 4. 코스 소개 카드 */}
      <section
        style={{
          marginTop: SECTION_MARGIN_TOP * scale,
        }}
      >
        <DetailDescriptionCard title="코스 소개" content={course.overview} />
      </section>

      {/* 5. 코스 지도 */}
      <div
        style={{
          marginTop: MAP_MARGIN_TOP * scale,
        }}
      >
        <CourseRouteMap stops={stops} />
      </div>

      {/* 6. 코스 장소 리스트 */}
      <div
        style={{
          marginTop: STOP_LIST_MARGIN_TOP * scale,
        }}
      >
        <CourseStopList stops={stops} onStopLikeToggle={handleStopLikeToggle} />
      </div>

      {/* 7. 최근 여행자들의 후기 */}
      <div style={{ marginTop: REVIEW_MARGIN_TOP * scale }}>
        <DetailReviewSection reviews={course.reviews} />
      </div>

      {/* 8. 하단 고정 리뷰 작성 버튼 */}
      <div
        style={{
          marginTop: REVIEW_BUTTON_MARGIN_TOP * scale,
        }}
      >
        <ReviewButton onClick={handleNavigateReview} />
      </div>
    </ResponsivePageShell>
  );
}

export default CourseDetailLayout;
