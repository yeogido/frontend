import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CourseReviewCard,
  CourseReviewCardSkeleton,
  ReviewDeleteDialog,
  ReviewEditModal,
} from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import {
  getReviewsFromPages,
  useReviewDelete,
  useReviewEdit,
  useReviews,
} from '../../hooks/useReviews';
import type { ReviewDetailModalReview } from '../../components/common/ReviewDetailModal';
import { toCourseDetailState } from '../../utils/reviewNavigation';
import { toReviewCourseCardProps } from '../../utils/reviewCard';
import { buildCourseDetailPath } from '../../utils/routes';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const LIST_MARGIN_TOP = 30;
const LIST_GAP = 16;
const MESSAGE_MARGIN_TOP = 40;
const MESSAGE_TEXT_SIZE = 13;

function RecentReviewCoursesPage() {
  const scale = useGlobalScale();
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviews('LATEST');
  const { requestDelete, dialogProps } = useReviewDelete();
  const { requestEdit, editorProps } = useReviewEdit();
  const navigate = useNavigate();
  // 카드를 누르면 코스 상세로 가서 그 후기 상세가 열린다. 코스 상세는 후기를
  // 최신 4개만 읽으므로 id 대신 후기를 통째로 넘긴다.
  const goToCourseDetail = (
    review: { courseType: string; courseId: number } & ReviewDetailModalReview
  ) =>
    navigate(buildCourseDetailPath(review.courseType, review.courseId), {
      state: toCourseDetailState(review),
    });

  const reviews = getReviewsFromPages(data?.pages).map(toReviewCourseCardProps);

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: handleIntersect,
  });

  const renderMessage = (message: string) => (
    <p
      className="text-gray-4 text-center font-medium"
      style={{
        marginTop: MESSAGE_MARGIN_TOP * scale,
        fontSize: MESSAGE_TEXT_SIZE * scale,
      }}
    >
      {message}
    </p>
  );

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold text-[#1C1C1C]"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          최근 후기
        </h1>
        <p
          className="font-normal text-[#505050]"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          최근 등록된 여행 후기를 모아봤어요
        </p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-4" style={{ marginTop: LIST_MARGIN_TOP * scale }}>
          {Array.from({ length: 1 }).map((_, index) => (
            <CourseReviewCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        renderMessage('후기를 불러오지 못했습니다.')
      ) : reviews.length === 0 ? (
        renderMessage('아직 등록된 후기가 없습니다.')
      ) : (
        <div
          className="flex flex-col"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            gap: LIST_GAP * scale,
          }}
        >
          {reviews.map((review) => (
            <CourseReviewCard
              key={review.id}
              image={review.image}
              title={review.title}
              duration={review.duration}
              transport={review.transport}
              companion={review.companion}
              tags={review.tags}
              profileImage={review.profileImage}
              nickname={review.nickname}
              meta={review.meta}
              content={review.content}
              rating={review.rating}
              isMine={review.isMine}
              onDeleteClick={() => requestDelete(review.id)}
              onEditClick={() => requestEdit(review)}
              onClick={() => goToCourseDetail(review)}
            />
          ))}

          <div ref={loadMoreRef} aria-hidden="true" />

          {isFetchingNextPage && (
            <CourseReviewCardSkeleton />
          )}
        </div>
      )}

      <ReviewEditModal key={editorProps.review?.id} {...editorProps} />

      <ReviewDeleteDialog {...dialogProps} />
    </section>
  );
}

export default RecentReviewCoursesPage;
