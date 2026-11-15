import { MdCalendarToday, MdLocationOn, MdPerson } from 'react-icons/md';

import chevronRight from '../../../assets/icons/chevron-right.svg';
import darkStar from '../../../assets/icons/dark star.svg';
import star from '../../../assets/icons/star.svg';
import ReviewActionMenu from '../../../components/common/ReviewActionMenu';
import ReviewerAvatar from '../../../components/common/ReviewerAvatar';
import TagChip from '../../../components/common/TagChip';
import type { toMyPostReviewCardProps } from '../utils/myPostReviewCard';

// Figma 1440 데스크톱 시안(6042:32062 card_mypage my_review) 기준 리터럴 px.
const AVATAR_SIZE = 48;
const STAR_SIZE = 20;
const STAR_COUNT = 5;
const COURSE_BOX_HEIGHT = 110;
const COURSE_THUMBNAIL_WIDTH = 116;
const COURSE_THUMBNAIL_HEIGHT = 86;
const TAG_HEIGHT = 20;
const MENU_TRIGGER_SIZE = 24;

type ReviewCardData = ReturnType<typeof toMyPostReviewCardProps>;

interface MyPostReviewDesktopCardProps {
  readonly review: ReviewCardData;
  readonly onOpenReview: () => void;
  readonly onOpenCourse: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

/**
 * 등록한 게시물의 후기 카드 — 작성자·별점·내용 위에 후기를 남긴 코스를
 * 회색 상자로 붙여 보여준다. 후기 본문과 코스 상자는 각각 따로 눌린다.
 */
function MyPostReviewDesktopCard({
  review,
  onOpenReview,
  onOpenCourse,
  onEdit,
  onDelete,
}: MyPostReviewDesktopCardProps) {
  const hasCourse = review.title !== '';

  return (
    <article className="border-gray-2 flex flex-col gap-[20px] border-b py-[20px]">
      <div className="flex items-start justify-between">
        <button
          type="button"
          onClick={onOpenReview}
          className="flex min-w-0 flex-col gap-[16px] text-left"
        >
          <span className="flex items-center gap-[12px]">
            <ReviewerAvatar
              src={review.profileImage}
              size={AVATAR_SIZE}
              isMine={review.isMine}
            />
            <span className="flex flex-col gap-[2px]">
              <span className="text-[14px] whitespace-nowrap text-black">
                <span className="font-semibold">{review.nickname}</span>
                {review.meta ? (
                  <span className="text-gray-4"> · {review.meta}</span>
                ) : null}
              </span>
              <span
                className="flex items-center"
                role="img"
                aria-label={`별점 ${review.rating}점`}
              >
                {Array.from({ length: STAR_COUNT }, (_, index) => (
                  <img
                    key={index}
                    src={index < review.rating ? star : darkStar}
                    alt=""
                    draggable={false}
                    style={{ width: STAR_SIZE, height: STAR_SIZE }}
                  />
                ))}
              </span>
            </span>
          </span>

          <span className="text-[16px] break-words text-black">
            {review.content}
          </span>
        </button>

        <div className="flex shrink-0 items-center p-[12px]">
          <ReviewActionMenu
            onEditClick={onEdit}
            onDeleteClick={onDelete}
            triggerClassName=""
            triggerSize={MENU_TRIGGER_SIZE}
            ariaLabel="후기 메뉴"
          />
        </div>
      </div>

      {hasCourse ? (
        <button
          type="button"
          onClick={onOpenCourse}
          aria-label={`${review.title} 코스 보기`}
          style={{ height: COURSE_BOX_HEIGHT }}
          className="bg-background flex w-full items-center justify-between rounded-[12px] p-[12px] text-left"
        >
          <span className="flex min-w-0 items-center gap-[16px]">
            <span
              style={{
                width: COURSE_THUMBNAIL_WIDTH,
                height: COURSE_THUMBNAIL_HEIGHT,
              }}
              className="bg-gray-2 block shrink-0 overflow-hidden rounded-[8px]"
            >
              {review.image ? (
                <img
                  src={review.image}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </span>

            <span className="flex min-w-0 flex-col gap-[15px]">
              <span className="flex min-w-0 flex-col gap-[4px]">
                <span className="truncate text-[16px] font-medium text-black">
                  {review.title}
                </span>
                <span className="text-gray-4 flex items-center gap-[4px] text-[12px] font-medium whitespace-nowrap">
                  {review.duration ? (
                    <span className="flex items-center gap-[2px]">
                      <MdCalendarToday
                        aria-hidden="true"
                        className="text-[14px]"
                      />
                      {review.duration}
                    </span>
                  ) : null}
                  {review.courseType ? (
                    <span className="flex items-center gap-[2px]">
                      <MdLocationOn
                        aria-hidden="true"
                        className="text-[14px]"
                      />
                      {review.courseType}
                    </span>
                  ) : null}
                  {review.companion ? (
                    <span className="flex items-center gap-[2px]">
                      <MdPerson aria-hidden="true" className="text-[14px]" />
                      {review.companion}
                    </span>
                  ) : null}
                </span>
              </span>

              {review.tags && review.tags.length > 0 ? (
                <span className="flex items-center gap-[4px]">
                  {review.tags.map((tag) => (
                    <TagChip
                      key={tag}
                      type={tag}
                      className="w-auto"
                      style={{ height: TAG_HEIGHT }}
                    />
                  ))}
                </span>
              ) : null}
            </span>
          </span>

          <img
            src={chevronRight}
            alt=""
            draggable={false}
            className="shrink-0"
            style={{ width: 24, height: 24 }}
          />
        </button>
      ) : null}
    </article>
  );
}

export default MyPostReviewDesktopCard;
