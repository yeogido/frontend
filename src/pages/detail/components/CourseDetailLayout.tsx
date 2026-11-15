import { CourseInfoBadgesCard } from './CourseInfoBadgesCard';
import { CourseRouteMap } from './CourseRouteMap';
import { CourseStopList } from './CourseStopList';
import { DetailDescriptionCard } from './DetailDescriptionCard';
import { DetailHeroSection } from './DetailHeroSection';
import { DetailReviewSection } from './DetailReviewSection';
import { DetailTitleSection } from './DetailTitleSection';
import { EditButton } from './EditButton';
import { FavoriteButton } from './FavoriteButton';
import { ReviewButton } from './ReviewButton';
import { ShareButton } from './ShareButton';
import { ShareToast } from './ShareToast';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';

import { useCourseDetailLayout } from '../hooks/useCourseDetailLayout';
import type { CourseDetailLayoutProps } from '../types/courseDetailLayout';
import {
  ReviewDeleteDialog,
  ReviewDetailModal,
  ReviewEditModal,
} from '../../../components/common';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import BackButton from '../../local-recommendation/components/BackButton';

export type { CourseDetailLayoutProps };

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_BOTTOM = 25;
const TITLE_SECTION_PADDING_TOP = 24;
const SECTION_MARGIN_TOP = 16;
const MAP_MARGIN_TOP = 24;
const STOP_LIST_MARGIN_TOP = 0;
const REVIEW_MARGIN_TOP = 24;
const REVIEW_BUTTON_MARGIN_TOP = 12;

export function CourseDetailLayout(props: CourseDetailLayoutProps) {
  return <CourseDetailLayoutContent key={props.course.id} {...props} />;
}

function CourseDetailLayoutContent(props: CourseDetailLayoutProps) {
  const { course, onBack } = props;
  const scale = useGlobalScale();
  const {
    canEdit,
    handleEdit,
    isLiked,
    handleFavoriteToggle,
    isFavoritePending,
    stops,
    focusedStopId,
    setFocusedStopId,
    handleStopLikeToggle,
    pendingPlaceIds,
    pendingContentIds,
    reviews,
    requestReviewDelete,
    requestReviewEdit,
    reviewDeleteDialogProps,
    reviewEditorProps,
    openReview,
    openedReview,
    incomingReview,
    closeReviewDetail,
    share,
    handleNavigateReview,
    handleNavigateCourseReviews,
  } = useCourseDetailLayout(props);

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
              canEdit ? (
                <EditButton label={course.title} onClick={handleEdit} />
              ) : (
                <FavoriteButton
                  isActive={isLiked}
                  label={course.title}
                  onClick={handleFavoriteToggle}
                  disabled={isFavoritePending}
                />
              )
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
          action={<ShareButton onClick={share.handleShare} />}
        />
      </div>

      <ShareToast copied={share.copied} isToastVisible={share.isToastVisible} />

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
        <CourseRouteMap
          stops={stops}
          focusedStopId={focusedStopId}
          onStopFocus={setFocusedStopId}
        />
      </div>

      {/* 6. 코스 장소 리스트 */}
      <div
        style={{
          marginTop: STOP_LIST_MARGIN_TOP * scale,
        }}
      >
        <CourseStopList
          stops={stops}
          onStopLikeToggle={handleStopLikeToggle}
          onStopFocus={setFocusedStopId}
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
          onReviewDelete={requestReviewDelete}
          onReviewEdit={requestReviewEdit}
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

      {/* 이미 이 코스의 상세라 코스 바로가기는 넣지 않는다. */}
      <ReviewDetailModal
        review={incomingReview ?? openedReview}
        courseTitle={course.title}
        onClose={closeReviewDetail}
      />

      <ReviewEditModal
        key={reviewEditorProps.review?.id}
        {...reviewEditorProps}
      />

      <ReviewDeleteDialog {...reviewDeleteDialogProps} />
    </ResponsivePageShell>
  );
}

export default CourseDetailLayout;
