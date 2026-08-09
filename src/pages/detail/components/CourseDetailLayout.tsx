import { useMemo, useState } from 'react';
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
import {
  ReviewDeleteDialog,
  ReviewDetailModal,
  ReviewEditModal,
} from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLoginModal } from '../../../hooks/useLoginModal';
import {
  formatTodayOpeningHours,
  usePlaceOpeningHours,
} from '../../../hooks/usePlaceOpeningHours';
import {
  useCourseReviewPreviews,
  useReviewDelete,
  useReviewDetailModal,
  useReviewEdit,
} from '../../../hooks/useReviews';
import { useAuthStore } from '../../../store/auth.store';
import { mapCourseReviewPreviews } from '../mappers/courseReviewMapper';
import BackButton from '../../local-recommendation/components/BackButton';
import {
  getCourseReviewsPath,
  type CourseReviewType,
} from '../../course-reviews/courseReviewRoute';

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
  readonly reviewType: CourseReviewType;
  readonly onFavoriteToggle?: (isLiked: boolean) => Promise<boolean>;
  readonly isFavoritePending?: boolean;
  readonly onPlaceLikeToggle?: (
    placeId: number,
    isLiked: boolean
  ) => Promise<boolean>;
  readonly onContentLikeToggle?: (
    contentId: number,
    isLiked: boolean
  ) => Promise<boolean>;
  readonly pendingPlaceIds?: ReadonlySet<number>;
  readonly pendingContentIds?: ReadonlySet<number>;
  readonly onBack?: () => void;
}

export function CourseDetailLayout({
  course,
  reviewType,
  onFavoriteToggle,
  isFavoritePending = false,
  onPlaceLikeToggle,
  onContentLikeToggle,
  pendingPlaceIds = new Set<number>(),
  pendingContentIds = new Set<number>(),
  onBack,
}: CourseDetailLayoutProps) {
  return (
    <CourseDetailLayoutContent
      key={course.id}
      course={course}
      reviewType={reviewType}
      onFavoriteToggle={onFavoriteToggle}
      isFavoritePending={isFavoritePending}
      onPlaceLikeToggle={onPlaceLikeToggle}
      onContentLikeToggle={onContentLikeToggle}
      pendingPlaceIds={pendingPlaceIds}
      pendingContentIds={pendingContentIds}
      onBack={onBack}
    />
  );
}

function CourseDetailLayoutContent({
  course,
  reviewType,
  onFavoriteToggle,
  isFavoritePending = false,
  onPlaceLikeToggle,
  onContentLikeToggle,
  pendingPlaceIds = new Set<number>(),
  pendingContentIds = new Set<number>(),
  onBack,
}: CourseDetailLayoutProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { openLoginModal } = useLoginModal();
  const numericCourseId = Number(course.id);
  const { data: courseReviews } = useCourseReviewPreviews(
    Number.isInteger(numericCourseId) ? numericCourseId : undefined
  );
  const reviews = mapCourseReviewPreviews(courseReviews?.items);
  const { requestDelete, dialogProps } = useReviewDelete();
  const { requestEdit, editorProps } = useReviewEdit();
  const { openedReview, openReview, closeReview } =
    useReviewDetailModal(reviews);

  const [isLiked, setIsLiked] = useState(course.liked);
  const [stops, setStops] = useState<readonly CourseStop[]>(course.stops);
  const { copied, isToastVisible, handleShare } = useShareToast();
  const openingHoursByStopId = usePlaceOpeningHours(
    stops.flatMap((stop) =>
      stop.placeId !== undefined
        ? [
            {
              id: stop.id,
              name: stop.name,
              address: stop.address,
              latitude: stop.location?.latitude,
              longitude: stop.location?.longitude,
            },
          ]
        : []
    )
  );
  const stopsWithOpeningHours = useMemo(
    () =>
      stops.map((stop) => {
        const hours = openingHoursByStopId.get(stop.id);
        const formattedHours = hours && formatTodayOpeningHours(hours);

        return stop.placeId !== undefined
          ? { ...stop, hours: formattedHours ?? '영업시간 정보 없음' }
          : stop;
      }),
    [openingHoursByStopId, stops]
  );

  const handleStopLikeToggle = (stopId: number) => {
    if (!isAuthenticated || !accessToken) {
      openLoginModal();
      return;
    }

    const stop = stops.find((item) => item.id === stopId);

    if (
      !stop ||
      (stop.placeId !== undefined && pendingPlaceIds.has(stop.placeId)) ||
      (stop.contentId !== undefined && pendingContentIds.has(stop.contentId))
    ) {
      return;
    }

    if (stop.placeId !== undefined && onPlaceLikeToggle) {
      void onPlaceLikeToggle(stop.placeId, stop.liked)
        .then((isLiked) => {
          setStops((prevStops) =>
            prevStops.map((item) =>
              item.id === stopId ? { ...item, liked: isLiked } : item
            )
          );
        })
        .catch(() => undefined);
      return;
    }

    if (stop.contentId !== undefined && onContentLikeToggle) {
      void onContentLikeToggle(stop.contentId, stop.liked)
        .then((isLiked) => {
          setStops((prevStops) =>
            prevStops.map((item) =>
              item.id === stopId ? { ...item, liked: isLiked } : item
            )
          );
        })
        .catch(() => undefined);
      return;
    }

    setStops((prevStops) =>
      prevStops.map((item) =>
        item.id === stopId ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const handleFavoriteToggle = () => {
    if (isFavoritePending) {
      return;
    }

    if (!isAuthenticated || !accessToken) {
      openLoginModal();
      return;
    }

    if (onFavoriteToggle) {
      void onFavoriteToggle(isLiked)
        .then(setIsLiked)
        .catch(() => undefined);
      return;
    }

    setIsLiked((previous) => !previous);
  };

  const handleNavigateReview = () => {
    if (!isAuthenticated || !accessToken) {
      openLoginModal();
      return;
    }

    navigate(`/review?type=${reviewType}&id=${course.id}`);
  };

  const handleNavigateCourseReviews = () => {
    // 후기 목록은 전체보기 화면이 직접 조회한다. 제목만 넘겨서 헤더 문구가
    // 조회를 기다리지 않고 바로 나오게 한다.
    navigate(getCourseReviewsPath(reviewType, course.id), {
      state: { courseTitle: course.title },
    });
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
        <div className="relative">
          <DetailHeroSection
            imageUrl={course.heroImageUrl}
            title={course.title}
            rightAction={
              <FavoriteButton
                isActive={isLiked}
                label={course.title}
                onClick={handleFavoriteToggle}
                disabled={isFavoritePending}
              />
            }
          />
          {onBack ? (
            <div className="absolute top-3 left-6 z-10">
              <BackButton onClick={onBack} />
            </div>
          ) : null}
        </div>
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
        <CourseRouteMap stops={stopsWithOpeningHours} />
      </div>

      {/* 6. 코스 장소 리스트 */}
      <div
        style={{
          marginTop: STOP_LIST_MARGIN_TOP * scale,
        }}
      >
        <CourseStopList
          stops={stopsWithOpeningHours}
          onStopLikeToggle={handleStopLikeToggle}
          pendingPlaceIds={pendingPlaceIds}
          pendingContentIds={pendingContentIds}
        />
      </div>

      {/* 7. 최근 여행자들의 후기 */}
      <div style={{ marginTop: REVIEW_MARGIN_TOP * scale }}>
        <DetailReviewSection
          reviews={reviews}
          courseTitle={course.title}
          onActionClick={handleNavigateCourseReviews}
          onReviewDelete={requestDelete}
          onReviewEdit={requestEdit}
          onReviewClick={openReview}
        />
      </div>

      {/* 8. 하단 고정 리뷰 작성 버튼 */}
      <div
        style={{
          marginTop: REVIEW_BUTTON_MARGIN_TOP * scale,
        }}
      >
        <ReviewButton onClick={handleNavigateReview} />
      </div>

      {/* 이미 이 코스의 상세라 '코스 바로가기'는 넣지 않는다. */}
      <ReviewDetailModal
        review={openedReview}
        courseTitle={course.title}
        onClose={closeReview}
      />

      <ReviewEditModal key={editorProps.review?.id} {...editorProps} />

      <ReviewDeleteDialog {...dialogProps} />
    </ResponsivePageShell>
  );
}

export default CourseDetailLayout;
