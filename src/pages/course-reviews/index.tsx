import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  LoadingSpinner,
  ReviewCard,
  ReviewDeleteDialog,
  ReviewDetailModal,
} from '../../components/common';
import { ResponsivePageShell } from '../../components/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import {
  getCourseReviewsFromPages,
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
  const { courseTitle = '' } =
    (location.state as CourseReviewListLocationState | null) ?? {};
  const courseType: CourseReviewType = location.pathname.startsWith(
    '/local-course/'
  )
    ? 'local-course'
    : 'yeogido-course';

  const parsedCourseId = Number(courseId);
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCourseReviews(
    Number.isInteger(parsedCourseId) ? parsedCourseId : undefined,
    sort === 'rating' ? 'RATING' : 'LATEST'
  );
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

  const reviewButton = (
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
      className="bg-[#F9F9F9]"
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
          {isPending ? (
            <LoadingSpinner
              className="w-full"
              label="코스 후기를 불러오는 중"
            />
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
                  profileImage={review.profileImage}
                  nickname={review.nickname}
                  meta={review.meta}
                  content={review.content}
                  rating={review.rating}
                  isMine={review.isMine}
                  onDeleteClick={() => requestDelete(review.id)}
                  onClick={() => navigate(courseDetailPath)}
                  onLongPress={() => openReview(review.id)}
                  className="[&>div>article]:!bg-[#F1F1F1]"
                />
              ))}

              <div ref={loadMoreRef} aria-hidden="true" />

              {isFetchingNextPage && (
                <LoadingSpinner
                  className="w-full"
                  label="후기를 더 불러오는 중"
                />
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

      {typeof document === 'undefined'
        ? reviewButton
        : createPortal(reviewButton, document.body)}
    </ResponsivePageShell>
  );
}

export default CourseReviewsPage;
