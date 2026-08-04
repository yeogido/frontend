import { useCallback, useState } from 'react';

import {
  ConfirmDialog,
  CourseReviewCard,
  LoadingSpinner,
  ReviewDetailModal,
} from '../../components/common';
import { useCourseLikeToggle } from '../../hooks/useCourseLikeToggle';
import { useNavigateToCourseDetail } from '../../hooks/useCourses';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import {
  getReviewsFromPages,
  useMyReviewIds,
  useReviewDelete,
  useReviews,
} from '../../hooks/useReviews';
import { toReviewCourseCardProps } from '../../utils/reviewCard';

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
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviews('LATEST');
  const myReviewIds = useMyReviewIds();
  const {
    isDeleteDialogOpen,
    isDeletePending,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useReviewDelete();

  const { goToCourseDetail } = useNavigateToCourseDetail();
  const [openedReviewId, setOpenedReviewId] = useState<number | null>(null);

  const reviews = getReviewsFromPages(data?.pages).map((review) =>
    toReviewCourseCardProps(review, myReviewIds)
  );
  const openedReview = reviews.find((review) => review.id === openedReviewId);

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
        <div style={{ marginTop: MESSAGE_MARGIN_TOP * scale }}>
          <LoadingSpinner className="w-full" label="최근 후기를 불러오는 중" />
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
              courseType={review.courseType}
              profileImage={review.profileImage}
              nickname={review.nickname}
              meta={review.meta}
              content={review.content}
              rating={review.rating}
              isMine={review.isMine}
              liked={getLiked(review.courseId, review.liked)}
              onLikeClick={() =>
                toggleLike(review.courseId, getLiked(review.courseId, review.liked))
              }
              onDeleteClick={() => requestDelete(review.id)}
              onClick={() => void goToCourseDetail(review.courseId)}
              onLongPress={() => setOpenedReviewId(review.id)}
            />
          ))}

          <div ref={loadMoreRef} aria-hidden="true" />

          {isFetchingNextPage && (
            <LoadingSpinner className="w-full" label="후기를 더 불러오는 중" />
          )}
        </div>
      )}

      <ReviewDetailModal
        isOpen={Boolean(openedReview)}
        courseTitle={openedReview?.title}
        images={openedReview?.images}
        content={openedReview?.content ?? ''}
        profileImage={openedReview?.profileImage ?? ''}
        nickname={openedReview?.nickname ?? ''}
        meta={openedReview?.meta ?? ''}
        rating={openedReview?.rating}
        onClose={() => setOpenedReviewId(null)}
        onGoToCourse={() => {
          if (openedReview) {
            void goToCourseDetail(openedReview.courseId);
          }
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="후기를 삭제할까요?"
        description="삭제한 후기는 되돌릴 수 없어요."
        isPending={isDeletePending}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </section>
  );
}

export default RecentReviewCoursesPage;
