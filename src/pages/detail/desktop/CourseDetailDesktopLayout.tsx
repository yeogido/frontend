import { FaHeart } from 'react-icons/fa6';
import { IoChevronForward } from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import shareIcon from '../../../assets/icons/share.svg';
import {
  CourseDeleteDialog,
  ReviewDeleteDialog,
  ReviewDetailModal,
  ReviewEditModal,
  TagChip,
} from '../../../components/common';
import { DesktopPageShell } from '../../../components/layout/desktop';
import { badgeDefinitionMap } from '../../../constants/badges';
import { useCourseDelete } from '../../../hooks/useCourses';
import { CourseRouteMap } from '../components/CourseRouteMap';
import { ShareToast } from '../components/ShareToast';
import { useCourseDetailLayout } from '../hooks/useCourseDetailLayout';
import type { CourseDetailLayoutProps } from '../types/courseDetailLayout';
import CourseActionMenu from './CourseActionMenu';
import CourseStopDesktopList from './CourseStopDesktopList';
import ReviewDesktopCard from './ReviewDesktopCard';

// Figma 1440 데스크톱 시안(6356:37541, 6356:38115) 기준 리터럴 px
const HERO_HEIGHT = 426;
const TAG_HEIGHT = 34;

export function CourseDetailDesktopLayout(props: CourseDetailLayoutProps) {
  return <CourseDetailDesktopContent key={props.course.id} {...props} />;
}

/**
 * 코스 상세 - 데스크톱 뷰. 좋아요, 후기 모달, 공유, 수정 흐름은
 * useCourseDetailLayout을 모바일 CourseDetailLayout과 같이 쓰고, 삭제는
 * 코스 목록과 같은 useCourseDelete로 연결한다.
 */
function CourseDetailDesktopContent(props: CourseDetailLayoutProps) {
  const { course } = props;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    numericCourseId,
    canEdit,
    handleEdit,
    isLiked,
    handleFavoriteToggle,
    isFavoritePending,
    stops,
    setFocusedStopId,
    focusedStopId,
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
  const { requestDelete, dialogProps: courseDeleteDialogProps } =
    useCourseDelete({
      onDeleted: (courseId) => {
        navigate('/local-course', { replace: true });
        queryClient.removeQueries({
          predicate: (query) =>
            query.queryKey[0] === 'localCourseDetail' &&
            query.queryKey[2] === courseId,
        });
      },
    });

  return (
    <DesktopPageShell>
      {props.onBack ? (
        <button
          type="button"
          onClick={props.onBack}
          className="text-gray-5 mb-[24px] text-[16px]"
        >
          이전 화면으로
        </button>
      ) : null}
      <div className="flex flex-col gap-[32px]">
        <div
          className="bg-gray-2 overflow-hidden rounded-[24px]"
          style={{ height: HERO_HEIGHT }}
        >
          <img
            src={course.heroImageUrl}
            alt={course.title}
            className="size-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-[100px]">
          <div className="flex flex-col gap-[32px]">
            <div className="flex flex-col gap-[40px]">
              <div className="flex flex-col gap-[16px]">
                <h1 className="text-[48px] font-semibold text-black">
                  {course.title}
                </h1>
                <p className="text-gray-4 text-[20px] leading-[1.5] font-medium whitespace-pre-line">
                  {course.overview}
                </p>
              </div>

              <div className="flex items-center justify-between gap-[16px]">
                <div className="flex flex-wrap items-center gap-[8px]">
                  {course.tags.map((tag) =>
                    tag.tagId ? (
                      <TagChip
                        key={tag.id}
                        type={tag.tagId}
                        className="w-auto"
                        style={{ height: TAG_HEIGHT }}
                      />
                    ) : (
                      <span
                        key={tag.id}
                        className="bg-background text-gray-5 inline-flex items-center rounded-full px-[12px] text-[16px] font-medium"
                        style={{ height: TAG_HEIGHT }}
                      >
                        {tag.label}
                      </span>
                    )
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-[16px]">
                  <button
                    type="button"
                    aria-label="코스 공유하기"
                    onClick={share.handleShare}
                    className="flex size-[32px] items-center justify-center"
                  >
                    <img
                      src={shareIcon}
                      alt=""
                      aria-hidden="true"
                      className="size-[24px]"
                    />
                  </button>
                  {canEdit ? (
                    <CourseActionMenu
                      label={course.title}
                      onEdit={handleEdit}
                      onDelete={() => requestDelete(numericCourseId)}
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label={
                        course.title + ' 좋아요 ' + (isLiked ? '취소' : '추가')
                      }
                      aria-pressed={isLiked}
                      onClick={handleFavoriteToggle}
                      disabled={isFavoritePending}
                      className="flex size-[32px] items-center justify-center disabled:opacity-50"
                    >
                      <FaHeart
                        aria-hidden="true"
                        className={
                          'text-[26px] ' +
                          (isLiked ? 'text-main-5' : 'text-gray-2')
                        }
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-2 h-px w-full" />

            <div className="flex flex-col gap-[40px]">
              <ul className="bg-background flex items-start justify-between rounded-[12px] px-[80px] py-[12px]">
                {course.infoBadges.map(({ id, label, icon }) => {
                  const badgeDef = badgeDefinitionMap[icon];

                  return (
                    <li
                      key={id}
                      className="flex flex-col items-center justify-center gap-[8px]"
                    >
                      {badgeDef ? (
                        <img
                          src={badgeDef.icon}
                          alt=""
                          aria-hidden="true"
                          className="size-[24px] shrink-0"
                          draggable={false}
                        />
                      ) : null}
                      <span className="text-gray-5 text-[16px] whitespace-nowrap">
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <CourseRouteMap
                stops={stops}
                focusedStopId={focusedStopId}
                onStopFocus={setFocusedStopId}
                showHeader={false}
              />

              <CourseStopDesktopList
                stops={stops}
                onStopLikeToggle={handleStopLikeToggle}
                onStopFocus={setFocusedStopId}
                pendingPlaceIds={pendingPlaceIds}
                pendingContentIds={pendingContentIds}
              />
            </div>
          </div>

          <section className="flex flex-col gap-[32px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-semibold text-black">
                최근 여행자들의 후기
              </h2>
              <button
                type="button"
                onClick={handleNavigateReview}
                className="text-gray-4 flex items-center gap-[8px] text-[18px] font-medium"
              >
                <MdEdit aria-hidden="true" className="text-[24px]" />
                리뷰 작성하기
              </button>
            </div>

            {reviews.length === 0 ? (
              <p
                role="status"
                className="bg-background text-gray-5 flex h-[249px] items-center justify-center rounded-[12px] text-[18px]"
              >
                등록된 리뷰가 없어요
              </p>
            ) : (
              <ul className="flex flex-col gap-[48px]">
                {reviews.map((review) => (
                  <li key={review.id}>
                    <ReviewDesktopCard
                      review={review}
                      onClick={() => openReview(review.id)}
                      onEditClick={() => requestReviewEdit(review)}
                      onDeleteClick={() => requestReviewDelete(review.id)}
                    />
                  </li>
                ))}
              </ul>
            )}

            {reviews.length > 0 ? (
              <button
                type="button"
                onClick={handleNavigateCourseReviews}
                className="border-gray-2 text-gray-4 flex items-center justify-center gap-[12px] rounded-[12px] border bg-white py-[16px] text-[18px] font-semibold"
              >
                리뷰 더보기
                <IoChevronForward aria-hidden="true" className="text-[20px]" />
              </button>
            ) : null}
          </section>
        </div>
      </div>

      <ShareToast copied={share.copied} isToastVisible={share.isToastVisible} />

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
      <CourseDeleteDialog {...courseDeleteDialogProps} />
    </DesktopPageShell>
  );
}

export default CourseDetailDesktopLayout;
