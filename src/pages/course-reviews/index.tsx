import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  ReviewCard,
  ReviewCardSkeleton,
  ReviewDeleteDialog,
  ReviewDetailModal,
} from '../../components/common';
import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { useCourseDetail } from '../../hooks/useCourses';
import {
  getCourseReviewsFromPages,
  isCourseNotFoundError,
  useCourseReviews,
  useMyReviewIds,
  useReviewDelete,
  useReviewDetailModal,
} from '../../hooks/useReviews';
import { getGutter } from '../../utils/responsiveLayout';
import { ReviewButton } from '../detail/components';
import { mapCourseReviewPreviews } from '../detail/mappers/courseReviewMapper';

import CourseReviewSortDropdown from './CourseReviewSortDropdown';
import type { CourseReviewType } from './courseReviewRoute';
import type { CourseReviewSort } from './courseReviewSort';

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

interface CourseReviewListLocationState {
  courseTitle?: string;
}

function CourseReviewsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const [sort, setSort] = useState<CourseReviewSort>('latest');
  const { courseTitle: courseTitleFromState = '' } =
    (location.state as CourseReviewListLocationState | null) ?? {};
  const courseType: CourseReviewType = location.pathname.startsWith(
    '/local-course/'
  )
    ? 'local-course'
    : 'yeogido-course';

  const parsedCourseId = Number(courseId);
  const validCourseId = Number.isInteger(parsedCourseId)
    ? parsedCourseId
    : undefined;
  const {
    data,
    error,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCourseReviews(validCourseId, sort === 'rating' ? 'RATING' : 'LATEST');
  // 코스 상세에서 넘어오면 제목이 state에 실려 오지만, 주소로 바로 들어오면
  // 없다. 그때만 코스를 읽어 채운다(state가 있으면 캐시가 없어도 조회하지
  // 않는다).
  const { data: courseDetail } = useCourseDetail(
    courseTitleFromState ? null : (validCourseId ?? null)
  );
  const courseTitle = courseTitleFromState || (courseDetail?.title ?? '');

  // 코스가 없는 것과 후기 조회가 실패한 것은 사용자가 할 수 있는 일이 다르다.
  const isCourseMissing =
    validCourseId === undefined || (isError && isCourseNotFoundError(error));
  // courseId가 잘못되면 쿼리가 비활성이라 isPending이 계속 true다. 그대로
  // 두면 스피너가 멈추지 않으므로 로딩으로 보지 않는다.
  const isLoading = validCourseId !== undefined && isPending;
  const myReviewIds = useMyReviewIds();
  const { requestDelete, dialogProps } = useReviewDelete();

  const reviews = mapCourseReviewPreviews(
    getCourseReviewsFromPages(data?.pages),
    myReviewIds
  );
  const { openedReview, openReview, closeReview } =
    useReviewDetailModal(reviews);

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: handleIntersect,
  });
  // 이 화면은 이미 코스가 정해져 있어 타입 조회 없이 경로를 만들 수 있다.
  const courseDetailPath = `/${courseType}/detail/${courseId}`;

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
              {reviews.map((review) => (
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
                  onClick={() => navigate(courseDetailPath)}
                  onLongPress={() => openReview(review.id)}
                  variant="course-review-list"
                  className="[&>div>article]:!bg-[#F9F9F9]"
                />
              ))}

              <div ref={loadMoreRef} aria-hidden="true" />

              {isFetchingNextPage && (
                <ReviewCardSkeleton variant="course-review-list" />
              )}
            </>
          )}
        </div>
      </section>

      <ReviewDetailModal
        review={openedReview}
        courseTitle={courseTitle || undefined}
        onClose={closeReview}
        onGoToCourse={() => navigate(courseDetailPath)}
      />

      <ReviewDeleteDialog {...dialogProps} />

      {!reviewButton || typeof document === 'undefined'
        ? reviewButton
        : createPortal(reviewButton, document.body)}
    </ResponsivePageShell>
  );
}

export default CourseReviewsPage;
