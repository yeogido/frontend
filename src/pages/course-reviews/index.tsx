import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import {
  ReviewCard,
  ReviewCardSkeleton,
  ReviewDeleteDialog,
  ReviewDetailModal,
  ReviewEditModal,
  ReviewTextCard,
} from '../../components/common';
import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { getGutter } from '../../utils/responsiveLayout';
import { ReviewButton } from '../detail/components';

import { CourseReviewSortDropdown } from './components';
import { useCourseReviewList } from './hooks/useCourseReviewList';

const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 117;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const FILTER_MARGIN_TOP = 11;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 16;
const REVIEW_BUTTON_BOTTOM = 32;
const MESSAGE_TEXT_SIZE = 13;

function CourseReviewsPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const {
    courseId,
    courseType,
    courseTitle,
    sort,
    setSort,
    reviews,
    isCourseMissing,
    isLoading,
    isError,
    isFetchingNextPage,
    loadMoreRef,
    requestDelete,
    dialogProps,
    requestEdit,
    editorProps,
    openedReview,
    openReview,
    closeReview,
  } = useCourseReviewList();

  const renderMessage = (message: string) => (
    <p
      className="text-gray-4 text-center font-medium"
      style={{ fontSize: MESSAGE_TEXT_SIZE * scale }}
    >
      {message}
    </p>
  );

  // 없는 코스에 후기를 쓰러 갈 수는 없다.
  const reviewButton = isCourseMissing ? null : (
    <div
      className="pointer-events-none fixed bottom-0 left-1/2 z-30 flex w-full max-w-[500px] -translate-x-1/2"
      style={{
        bottom: `max(${REVIEW_BUTTON_BOTTOM * scale}px, env(safe-area-inset-bottom, 0px))`,
        paddingInline: getGutter(scale),
      }}
    >
      <ReviewButton
        className="pointer-events-auto"
        onClick={() =>
          courseId && navigate(`/review?type=${courseType}&id=${courseId}`)
        }
      />
    </div>
  );

  return (
    <ResponsivePageShell
      mode="main-layout"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={PAGE_PADDING_BOTTOM}
      className="bg-[#F1F1F1]"
    >
      <section className="flex flex-col">
        <div>
          <h1
            className="font-semibold text-[#1C1C1C]"
            style={{
              fontSize: TITLE_SIZE * scale,
              lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
            }}
          >
            코스 후기
          </h1>
          <p
            className="font-normal text-[#505050]"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP * scale,
              fontSize: DESCRIPTION_SIZE * scale,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            {courseTitle
              ? `${courseTitle}를 다녀온 여행자들의 후기를 확인해 보세요.`
              : '이 코스를 다녀온 여행자들의 후기를 확인해 보세요.'}
          </p>
        </div>
        <div
          className="flex justify-end"
          style={{ marginTop: FILTER_MARGIN_TOP * scale }}
        >
          <CourseReviewSortDropdown value={sort} onChange={setSort} />
        </div>
        <div
          className="flex flex-col"
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
        >
          {isLoading ? (
            Array.from({ length: 1 }).map((_, index) => (
              <ReviewCardSkeleton key={index} variant="course-review-list" />
            ))
          ) : isCourseMissing ? (
            renderMessage('삭제되었거나 존재하지 않는 코스입니다.')
          ) : isError ? (
            renderMessage('후기를 불러오지 못했습니다.')
          ) : reviews.length === 0 ? (
            renderMessage('아직 등록된 후기가 없습니다.')
          ) : (
            <>
              {/* 사진은 선택이라 없는 후기가 있다. 그때는 본문만 그린다. */}
              {reviews.map((review) =>
                review.images.length > 0 ? (
                  <ReviewCard
                    key={review.id}
                    images={review.images}
                    courseTitle={courseTitle || undefined}
                    profileImage={review.profileImage}
                    nickname={review.nickname}
                    meta={review.meta}
                    content={review.content}
                    rating={review.rating}
                    isMine={review.isMine}
                    onDeleteClick={() => requestDelete(review.id)}
                    onEditClick={() => requestEdit(review)}
                    onClick={() => openReview(review.id)}
                    variant="course-review-list"
                    className="[&>div>article]:!bg-[#F9F9F9]"
                  />
                ) : (
                  <ReviewTextCard
                    key={review.id}
                    profileImage={review.profileImage}
                    nickname={review.nickname}
                    meta={review.meta}
                    content={review.content}
                    rating={review.rating}
                    isMine={review.isMine}
                    onDeleteClick={() => requestDelete(review.id)}
                    onEditClick={() => requestEdit(review)}
                    onClick={() => openReview(review.id)}
                  />
                )
              )}

              <div ref={loadMoreRef} aria-hidden="true" />

              {isFetchingNextPage && (
                <ReviewCardSkeleton variant="course-review-list" />
              )}
            </>
          )}
        </div>
      </section>

      {/* 이 코스의 후기 목록이라 '코스 바로가기'는 넣지 않는다. */}
      <ReviewDetailModal
        review={openedReview}
        courseTitle={courseTitle || undefined}
        onClose={closeReview}
      />

      <ReviewEditModal key={editorProps.review?.id} {...editorProps} />

      <ReviewDeleteDialog {...dialogProps} />

      {!reviewButton || typeof document === 'undefined'
        ? reviewButton
        : createPortal(reviewButton, document.body)}
    </ResponsivePageShell>
  );
}

export default CourseReviewsPage;
