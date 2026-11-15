import {
  CourseCard,
  CourseCardSkeleton,
  CourseFilterBar,
  CourseReviewCard,
  PromotionCard,
  SearchBar,
} from '../../components/common';
import {
  getMyPostFilterColumnClassName,
  MY_POST_FILTER_GRID_CLASS_NAME,
} from '../../constants/courseFilterLayout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { toContentTagIds } from '../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../utils/courseEnumLabels';

import MyPostsDialogs from './components/MyPostsDialogs';
import { useMyPostsPage } from './hooks/useMyPostsPage';
import { toMyPostReviewCardProps } from './utils/myPostReviewCard';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const SEARCH_MARGIN_TOP = 16;
const FILTER_MARGIN_TOP = 10;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const EMPTY_TEXT_SIZE = 13;
const RETRY_BUTTON_PADDING_X = 16;
const RETRY_BUTTON_PADDING_Y = 8;
const RETRY_BUTTON_TEXT_SIZE = 14;
const SKELETON_COUNT = 3;

function MyPostsPage() {
  const scale = useGlobalScale();
  const {
    isBusinessUser,
    setKeyword,
    filterContainerRef,
    openFilterKey,
    selectedFilters,
    handleFilterToggle,
    handleFilterSelect,
    filterGroups,
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

  const renderMessage = (message: string) => (
    <p
      className="text-gray-4 text-center font-medium"
      style={{
        marginTop: EMPTY_MARGIN_TOP * scale,
        fontSize: EMPTY_TEXT_SIZE * scale,
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
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          {isBusinessUser ? '등록한 코스, 후기와 홍보글' : '등록한 코스와 후기'}
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          {isBusinessUser
            ? '직접 등록한 코스, 후기와 홍보글을 확인해보세요'
            : '직접 등록한 코스와 후기를 확인해 보세요'}
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchBar
          placeholder="내가 등록한 코스나 후기를 검색해 보세요"
          label="등록한 게시물 검색"
          onSearch={setKeyword}
        />
      </div>

      <CourseFilterBar
        filterGroups={filterGroups}
        selectedFilters={selectedFilters}
        openFilterKey={openFilterKey}
        filterContainerRef={filterContainerRef}
        gridClassName={MY_POST_FILTER_GRID_CLASS_NAME}
        getColumnClassName={getMyPostFilterColumnClassName}
        marginTop={FILTER_MARGIN_TOP}
        onToggle={handleFilterToggle}
        onSelect={handleFilterSelect}
      />

      {isPending ? (
        <div
          className="flex flex-col"
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div
          className="flex flex-col items-center"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            gap: EMPTY_MARGIN_TOP * scale,
          }}
        >
          <p
            className="text-gray-4 text-center font-medium"
            style={{ fontSize: EMPTY_TEXT_SIZE * scale }}
          >
            게시물을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-full border border-[#e4e4e4] font-medium text-[#505050]"
            style={{
              paddingLeft: RETRY_BUTTON_PADDING_X * scale,
              paddingRight: RETRY_BUTTON_PADDING_X * scale,
              paddingTop: RETRY_BUTTON_PADDING_Y * scale,
              paddingBottom: RETRY_BUTTON_PADDING_Y * scale,
              fontSize: RETRY_BUTTON_TEXT_SIZE * scale,
            }}
          >
            다시 시도
          </button>
        </div>
      ) : items.length === 0 ? (
        renderMessage('등록한 게시물이 없습니다.')
      ) : (
        <div
          className="flex flex-col"
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
        >
          {items.map((item) => {
            if (item.review) {
              const review = item.review;
              const reviewCard = toMyPostReviewCardProps(review, item.course);

              return (
                <CourseReviewCard
                  key={`review-${reviewCard.id}`}
                  image={reviewCard.image}
                  title={reviewCard.title}
                  duration={reviewCard.duration}
                  transport={reviewCard.courseType}
                  companion={reviewCard.companion}
                  tags={reviewCard.tags}
                  profileImage={reviewCard.profileImage}
                  nickname={reviewCard.nickname}
                  meta={reviewCard.meta}
                  content={reviewCard.content}
                  rating={reviewCard.rating}
                  isMine={reviewCard.isMine}
                  onClick={() => void openReviewDetail(reviewCard)}
                  onEditClick={() => requestEdit(reviewCard)}
                  onDeleteClick={() => requestDelete(reviewCard.id)}
                />
              );
            }

            if (item.course) {
              const course = item.course;

              return (
                <CourseCard
                  key={`course-${course.id}`}
                  image={course.routeImageUrl ?? course.thumbnailUrl}
                  title={course.title}
                  duration={toDurationLabel(course.durationType)}
                  courseType={toTransportLabel(course.transportType)}
                  companion={toCompanionLabel(course.companionType)}
                  tags={toContentTagIds(course.hashtags)}
                  canManage
                  onClick={() => void goToCourseDetail(course.id)}
                  showEdit
                  onEditClick={() => void handleEditCourse(course.id)}
                  onDeleteClick={() => requestCourseDelete(course.id)}
                />
              );
            }

            if (item.promotion) {
              const promotion = item.promotion;

              return (
                <PromotionCard
                  key={`promotion-${promotion.promotionId}`}
                  variant="compact"
                  imageUrl={promotion.thumbnailImageUrl}
                  title={promotion.placeName}
                  description={promotion.shortDescription}
                  tags={toContentTagIds(promotion.hashtags)}
                  isMine
                  onClick={() => goToPromotion(promotion.promotionId)}
                  onEditClick={() => editPromotion(promotion.promotionId)}
                  onDeleteClick={() =>
                    requestPromotionDelete(promotion.promotionId)
                  }
                />
              );
            }

            return null;
          })}

          <div ref={loadMoreRef} aria-hidden="true" />

          {isFetchingNextPage && <CourseCardSkeleton />}
        </div>
      )}

      <MyPostsDialogs dialogs={dialogs} />
    </section>
  );
}

export default MyPostsPage;
