import {
  MdCalendarToday,
  MdLocationOn,
  MdPerson,
  MdStorefront,
} from 'react-icons/md';

import ReviewActionMenu from '../../../components/common/ReviewActionMenu';
import { toContentTagIds } from '../../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';
import DesktopFilterDropdown from '../../../components/layout/desktop/DesktopFilterDropdown';
import MyActivityListCard from '../../my-activity/desktop/MyActivityListCard';
import MyActivityShell from '../../my-activity/desktop/MyActivityShell';
import MyPostsDialogs from '../components/MyPostsDialogs';
import { MY_POST_SORT_OPTIONS } from '../constants/filters';
import { useMyPostsPage } from '../hooks/useMyPostsPage';
import { toMyPostReviewCardProps } from '../utils/myPostReviewCard';
import MyPostReviewDesktopCard from './MyPostReviewDesktopCard';

// Figma 1440 데스크톱 시안(5745:35885) 기준 리터럴 px.
const MENU_TRIGGER_SIZE = 24;
const MENU_PADDING = 12;
const SKELETON_COUNT = 3;
const SKELETON_HEIGHT = 151;

function MyPostsDesktopPage() {
  const {
    categoryOptions,
    selectedFilters,
    handleFilterSelect,
    items,
    isPending,
    isError,
    refetch,
    isFetchingNextPage,
    loadMoreRef,
    goToCourseDetail,
    openReviewDetail,
    handleEditCourse,
    goToPromotion,
    editPromotion,
    requestDelete,
    requestEdit,
    requestCourseDelete,
    requestPromotionDelete,
    dialogs,
  } = useMyPostsPage();

  const renderMenu = (
    label: string,
    onEdit: () => void,
    onDelete: () => void
  ) => (
    <div style={{ padding: MENU_PADDING }}>
      <ReviewActionMenu
        onEditClick={onEdit}
        onDeleteClick={onDelete}
        triggerClassName=""
        triggerSize={MENU_TRIGGER_SIZE}
        ariaLabel={label}
      />
    </div>
  );

  return (
    <MyActivityShell activeTab="posts">
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center justify-between">
          <DesktopFilterDropdown
            label="분류"
            options={categoryOptions}
            value={selectedFilters.category}
            onChange={(option) => handleFilterSelect('category', option)}
          />
          <DesktopFilterDropdown
            label="정렬"
            options={MY_POST_SORT_OPTIONS}
            value={selectedFilters.sort}
            onChange={(option) => handleFilterSelect('sort', option)}
            align="right"
          />
        </div>

        {isPending ? (
          <div className="flex flex-col" aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div
                key={index}
                style={{ height: SKELETON_HEIGHT }}
                className="border-gray-2 border-b py-[20px]"
              >
                <div className="bg-gray-2 h-full w-full animate-pulse rounded-[12px]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="mt-[40px] flex flex-col items-center gap-[24px]">
            <p role="alert" className="text-gray-4 text-[16px] font-medium">
              게시물을 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="border-gray-2 text-gray-5 rounded-full border px-[16px] py-[8px] text-[16px] font-medium"
            >
              다시 시도
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-4 mt-[40px] text-center text-[16px] font-medium">
            등록한 게시물이 없습니다.
          </p>
        ) : (
          <div className="flex flex-col">
            {items.map((item) => {
              if (item.review) {
                const reviewCard = toMyPostReviewCardProps(
                  item.review,
                  item.course
                );

                return (
                  <MyPostReviewDesktopCard
                    key={`review-${reviewCard.id}`}
                    review={reviewCard}
                    onOpenReview={() => void openReviewDetail(reviewCard)}
                    onOpenCourse={() =>
                      reviewCard.courseId !== undefined
                        ? void goToCourseDetail(reviewCard.courseId)
                        : void openReviewDetail(reviewCard)
                    }
                    onEdit={() => requestEdit(reviewCard)}
                    onDelete={() => requestDelete(reviewCard.id)}
                  />
                );
              }

              if (item.course) {
                const course = item.course;

                return (
                  <MyActivityListCard
                    key={`course-${course.id}`}
                    image={course.routeImageUrl ?? course.thumbnailUrl}
                    title={course.title}
                    info={[
                      {
                        icon: MdCalendarToday,
                        text: toDurationLabel(course.durationType),
                      },
                      {
                        icon: MdLocationOn,
                        text: toTransportLabel(course.transportType),
                      },
                      {
                        icon: MdPerson,
                        text: toCompanionLabel(course.companionType),
                      },
                    ]}
                    tags={toContentTagIds(course.hashtags)}
                    onClick={() => void goToCourseDetail(course.id)}
                    action={renderMenu(
                      `${course.title} 코스 메뉴`,
                      () => void handleEditCourse(course.id),
                      () => requestCourseDelete(course.id)
                    )}
                  />
                );
              }

              if (item.promotion) {
                const promotion = item.promotion;

                return (
                  <MyActivityListCard
                    key={`promotion-${promotion.promotionId}`}
                    image={promotion.thumbnailImageUrl}
                    title={promotion.placeName}
                    info={[
                      {
                        icon: MdStorefront,
                        text: promotion.shortDescription,
                      },
                    ]}
                    tags={toContentTagIds(promotion.hashtags)}
                    onClick={() => goToPromotion(promotion.promotionId)}
                    action={renderMenu(
                      `${promotion.placeName} 홍보글 메뉴`,
                      () => editPromotion(promotion.promotionId),
                      () => requestPromotionDelete(promotion.promotionId)
                    )}
                  />
                );
              }

              return null;
            })}

            <div ref={loadMoreRef} aria-hidden="true" />

            {isFetchingNextPage ? (
              <p className="text-gray-4 py-[20px] text-center text-[16px]">
                불러오는 중이에요.
              </p>
            ) : null}
          </div>
        )}
      </div>

      <MyPostsDialogs dialogs={dialogs} />
    </MyActivityShell>
  );
}

export default MyPostsDesktopPage;
