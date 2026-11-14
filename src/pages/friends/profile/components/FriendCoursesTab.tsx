import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCalendarToday, MdLocationOn, MdPerson } from 'react-icons/md';

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
import TagChip from '../../../../components/common/TagChip';
import heart from '../../../../assets/icons/heart.svg';
import oheart from '../../../../assets/icons/oheart.svg';

const LIST_GAP = 16;
const SKELETON_COUNT = 3;
const LOAD_ERROR_MESSAGE = '코스 목록을 불러오지 못했어요.';
const LOAD_MORE_ERROR_MESSAGE = '코스를 더 불러오지 못했어요.';

interface FriendCoursesTabProps {
  friendUserId: number;
  scale: number;
  desktop?: boolean;
}

/** 친구가 등록한 우리동네 코스. 관리 메뉴 없이 보기와 좋아요만 한다. */
function FriendCoursesTab({
  friendUserId,
  scale,
  desktop = false,
}: FriendCoursesTabProps) {
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
        className={
          desktop
            ? 'grid grid-cols-2 gap-x-[24px] gap-y-[24px]'
            : 'flex flex-col'
        }
        style={desktop ? undefined : { gap: LIST_GAP * scale }}
      >
        {courses.map((course) =>
          desktop ? (
            <li key={course.courseId} className="min-w-0">
              <article>
                <div className="bg-background relative h-[172px] overflow-hidden rounded-[12px]">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/local-course/detail/${course.courseId}`)
                    }
                    aria-label={`${course.title} 상세 보기`}
                    className="block size-full"
                  >
                    {toCourseCardProps(course).image ? (
                      <img
                        src={toCourseCardProps(course).image}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    aria-label={`${course.title} ${getLiked(course.courseId, course.isLiked) ? '좋아요 취소' : '좋아요'}`}
                    aria-pressed={getLiked(course.courseId, course.isLiked)}
                    onClick={() =>
                      toggleLike(
                        course.courseId,
                        getLiked(course.courseId, course.isLiked)
                      )
                    }
                    className="absolute top-[16px] right-[16px] p-1"
                  >
                    <img
                      src={
                        getLiked(course.courseId, course.isLiked)
                          ? oheart
                          : heart
                      }
                      alt=""
                      className="size-[24px]"
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/local-course/detail/${course.courseId}`)
                  }
                  className="mt-[16px] block w-full truncate text-left text-[20px] font-semibold"
                >
                  {course.title}
                </button>
                <div className="text-gray-4 mt-[10px] flex flex-wrap gap-[8px] text-[14px]">
                  {[
                    [MdCalendarToday, toCourseCardProps(course).duration],
                    [MdLocationOn, toCourseCardProps(course).courseType],
                    [MdPerson, toCourseCardProps(course).companion],
                  ].map(([Icon, label], index) =>
                    typeof Icon !== 'string' && label ? (
                      <span key={index} className="flex items-center gap-1">
                        <Icon aria-hidden="true" />
                        {label as string}
                      </span>
                    ) : null
                  )}
                </div>
                <div className="mt-[12px] flex flex-wrap gap-1">
                  {toCourseCardProps(course).tags.map((tag, index) => (
                    <TagChip
                      key={`${tag}-${index}`}
                      type={tag}
                      style={{ height: 26 }}
                    />
                  ))}
                </div>
              </article>
            </li>
          ) : (
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
          )
        )}
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
