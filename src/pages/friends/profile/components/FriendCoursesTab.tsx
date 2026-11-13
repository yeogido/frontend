import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../../../../apis/common';
import {
  CourseCard,
  CourseCardSkeleton,
  LoadingSpinner,
} from '../../../../components/common';
import { useCourseLikeToggle } from '../../../../hooks/useCourseLikeToggle';
import { useFriendLocalCourses } from '../../../../hooks/useFriendProfile';
import useInfiniteScroll from '../../../../hooks/useInfiniteScroll';
import { canFetchNextRequestPage } from '../../../../hooks/utils/friendRequestPages';
import { toCourseCardProps } from '../../../../utils/courseCard';
import FriendListMessage from '../../components/FriendListMessage';
import {
  canLoadMoreAutomatically,
  shouldShowLoadMoreError,
} from '../../utils/friendListStatus';
import FriendProfileMessage from './FriendProfileMessage';

const LIST_GAP = 16;
const SKELETON_COUNT = 3;
const LOAD_ERROR_MESSAGE = '코스 목록을 불러오지 못했어요.';
const LOAD_MORE_ERROR_MESSAGE = '코스를 더 불러오지 못했어요.';

interface FriendCoursesTabProps {
  friendUserId: number;
  scale: number;
}

/** 친구가 등록한 우리동네 코스. 관리 메뉴 없이 보기와 좋아요만 한다. */
function FriendCoursesTab({ friendUserId, scale }: FriendCoursesTabProps) {
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const {
    courses,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useFriendLocalCourses(friendUserId);

  const handleLoadMore = useCallback(() => {
    if (
      canFetchNextRequestPage({ hasNextPage, isFetching, isFetchingNextPage })
    ) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: canLoadMoreAutomatically({ hasNextPage, isPending, isError }),
    onIntersect: handleLoadMore,
  });

  const showLoadMoreError = shouldShowLoadMoreError({
    isFetchNextPageError,
    isFetchingNextPage,
    friendCount: courses.length,
  });

  let content;

  if (isPending) {
    content = (
      <div className="flex flex-col" style={{ gap: LIST_GAP * scale }}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    );
  } else if (isError && courses.length === 0) {
    content = (
      <FriendListMessage
        variant="error"
        scale={scale}
        errorMessage={getApiErrorMessage(error, LOAD_ERROR_MESSAGE)}
        onRetry={() => void refetch()}
      />
    );
  } else if (courses.length === 0) {
    content = (
      <FriendProfileMessage message="아직 등록한 코스가 없어요" scale={scale} />
    );
  } else {
    content = (
      <ul
        aria-label="우리동네 추천 코스"
        className="flex flex-col"
        style={{ gap: LIST_GAP * scale }}
      >
        {courses.map((course) => (
          <li key={course.courseId}>
            <CourseCard
              {...toCourseCardProps(course)}
              canManage={false}
              liked={getLiked(course.courseId, course.isLiked)}
              onClick={() =>
                navigate(`/local-course/detail/${course.courseId}`)
              }
              onLikeClick={() =>
                toggleLike(
                  course.courseId,
                  getLiked(course.courseId, course.isLiked)
                )
              }
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      {content}
      {showLoadMoreError ? (
        <FriendListMessage
          variant="load-more-error"
          scale={scale}
          errorMessage={getApiErrorMessage(error, LOAD_MORE_ERROR_MESSAGE)}
          onRetry={() => void fetchNextPage()}
        />
      ) : null}
      <div ref={loadMoreRef} aria-hidden="true" />
      {isFetchingNextPage ? (
        <LoadingSpinner label="코스를 더 불러오는 중" />
      ) : null}
    </>
  );
}

export default FriendCoursesTab;
