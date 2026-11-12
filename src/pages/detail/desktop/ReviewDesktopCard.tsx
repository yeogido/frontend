import darkStar from '../../../assets/icons/dark star.svg';
import star from '../../../assets/icons/star.svg';
import ReviewActionMenu from '../../../components/common/ReviewActionMenu';
import ReviewerAvatar from '../../../components/common/ReviewerAvatar';
import type { CourseReview } from '../types/courseDetail';

// Figma 1440 데스크톱 시안(6356:38115 후기 카드) 기준 리터럴 px
const AVATAR_SIZE = 44;
const STAR_SIZE = 18;
const PHOTO_WIDTH = 128;
const PHOTO_HEIGHT = 116;
const MAX_PHOTOS = 3;

export interface ReviewDesktopCardProps {
  readonly review: CourseReview;
  readonly onClick?: () => void;
  readonly onEditClick?: () => void;
  readonly onDeleteClick?: () => void;
}

/**
 * 코스 상세의 후기 카드 한 장. 모바일은 가로 캐러셀의 카드라서 사진 유무에
 * 따라 카드 종류가 갈리지만, 데스크톱은 세로 목록이라 한 카드에서 사진을
 * 있으면 보여주는 식으로 합쳤다. 본인 후기의 더보기 메뉴는 모바일과 같다.
 */
function ReviewDesktopCard({
  review,
  onClick,
  onEditClick,
  onDeleteClick,
}: ReviewDesktopCardProps) {
  const rating = Math.min(Math.max(Math.round(review.rating), 0), 5);
  const photos = review.images.slice(0, MAX_PHOTOS);

  return (
    <article
      className="relative flex flex-col gap-[20px] rounded-[12px] bg-white p-[20px] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      aria-label={review.nickname + '님의 후기'}
    >
      <div className="flex items-center gap-[12px]">
        <ReviewerAvatar
          src={review.profileImage}
          size={AVATAR_SIZE}
          isMine={review.isMine}
        />
        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="flex items-baseline gap-[6px] text-[18px] leading-none">
            <span className="font-semibold text-black">{review.nickname}</span>
            <span className="text-gray-4 shrink-0 font-normal">
              · {review.meta}
            </span>
          </p>
          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <img
                key={index}
                src={index < rating ? star : darkStar}
                alt=""
                aria-hidden="true"
                className={index < rating ? '' : 'scale-[1.42]'}
                style={{ width: STAR_SIZE, height: STAR_SIZE }}
              />
            ))}
          </div>
        </div>

        {review.isMine ? (
          <ReviewActionMenu
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            triggerClassName="absolute top-[20px] right-[20px] z-10"
          />
        ) : null}
      </div>

      <p className="text-[18px] leading-[1.5] break-keep whitespace-pre-line text-black">
        {review.content}
      </p>

      {photos.length > 0 ? (
        <ul className="flex gap-[12px]">
          {photos.map((src, index) => (
            <li key={src + index}>
              <img
                src={src}
                alt=""
                className="rounded-[12px] object-cover"
                style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={review.nickname + '님의 후기 자세히 보기'}
          className="absolute inset-0 cursor-pointer rounded-[12px]"
        />
      ) : null}
    </article>
  );
}

export default ReviewDesktopCard;
