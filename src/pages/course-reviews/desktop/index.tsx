import { useNavigate } from 'react-router-dom';

import {
  ReviewDeleteDialog,
  ReviewDetailModal,
  ReviewEditModal,
} from '../../../components/common';
import { DesktopPageShell } from '../../../components/layout/desktop';
import DesktopFilterDropdown from '../../../components/layout/desktop/DesktopFilterDropdown';
import ReviewDesktopCard from '../../detail/desktop/ReviewDesktopCard';
import { courseReviewSortOptions } from '../constants/courseReviewSort';
import { useCourseReviewList } from '../hooks/useCourseReviewList';

// Figma 1440 데스크톱 시안(6934:53263) 기준 리터럴 px.
const TITLE_OFFSET_TOP = 60;
const SORT_LABELS = courseReviewSortOptions.map((option) => option.label);

/**
 * 데스크톱 코스 후기 전체 목록 — 코스 상세의 "리뷰 더보기"로 들어온다.
 * 데이터·수정·삭제는 모바일 목록과 같은 useCourseReviewList를 쓴다.
 */
function CourseReviewsDesktopPage() {
  const navigate = useNavigate();
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

  const sortLabel =
    courseReviewSortOptions.find((option) => option.value === sort)?.label ??
    SORT_LABELS[0];

  const message = isLoading
    ? '후기를 불러오는 중이에요.'
    : isCourseMissing
      ? '삭제되었거나 존재하지 않는 코스입니다.'
      : isError
        ? '후기를 불러오지 못했습니다.'
        : reviews.length === 0
          ? '아직 등록된 후기가 없습니다.'
          : null;

  return (
    <DesktopPageShell>
      <div
        style={{ paddingTop: TITLE_OFFSET_TOP }}
        className="flex flex-col gap-[32px]"
      >
        <header className="flex flex-col gap-[6px]">
          <h1 className="text-[32px] font-semibold text-black">
            {courseTitle ? `${courseTitle} 후기` : '코스 후기'}
          </h1>
          <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
            이 코스를 다녀온 여행자들의 후기를 확인해 보세요
          </p>
        </header>

        <div className="flex justify-end">
          <DesktopFilterDropdown
            label="정렬"
            options={SORT_LABELS}
            value={sortLabel}
            align="right"
            onChange={(label) => {
              const option = courseReviewSortOptions.find(
                (item) => item.label === label
              );
              if (option) setSort(option.value);
            }}
          />
        </div>

        {message ? (
          <p
            role={isError || isCourseMissing ? 'alert' : 'status'}
            className="text-gray-4 py-[48px] text-center text-[16px] font-medium"
          >
            {message}
          </p>
        ) : (
          <ul className="flex flex-col gap-[48px]">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewDesktopCard
                  review={review}
                  onClick={() => openReview(review.id)}
                  onEditClick={() => requestEdit(review)}
                  onDeleteClick={() => requestDelete(review.id)}
                />
              </li>
            ))}
          </ul>
        )}

        <div ref={loadMoreRef} className="h-[1px]" aria-hidden="true" />

        {isFetchingNextPage ? (
          <p className="text-gray-4 text-center text-[16px]">
            후기를 더 불러오는 중이에요.
          </p>
        ) : null}

        {isCourseMissing ? null : (
          <button
            type="button"
            onClick={() =>
              courseId && navigate(`/review?type=${courseType}&id=${courseId}`)
            }
            className="bg-main-5 w-full rounded-[12px] py-[16px] text-[18px] font-semibold text-white"
          >
            리뷰 작성하기
          </button>
        )}
      </div>

      {/* 이 코스의 후기 목록이라 '코스 바로가기'는 넣지 않는다. */}
      <ReviewDetailModal
        review={openedReview}
        courseTitle={courseTitle || undefined}
        onClose={closeReview}
      />
      <ReviewEditModal key={editorProps.review?.id} {...editorProps} />
      <ReviewDeleteDialog {...dialogProps} />
    </DesktopPageShell>
  );
}

export default CourseReviewsDesktopPage;
