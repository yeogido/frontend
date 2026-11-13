import { MdCalendarToday, MdLocationOn } from 'react-icons/md';

import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import CardActionMenu from '../../../components/common/CardActionMenu';
import TagChip, { type TagType } from '../../../components/common/TagChip';

// Figma 1440 데스크톱 시안(6276:38944 card_desktop) 기준 리터럴 px.
const IMAGE_HEIGHT = 236;
const LIKE_SIZE = 28;
const TAG_HEIGHT = 25;
const MAX_TAGS = 3;

interface FestivalDesktopCardProps {
  readonly image: string | null;
  readonly title: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly regionName: string;
  readonly tags: readonly TagType[];
  readonly isAdmin: boolean;
  readonly liked: boolean;
  readonly onClick: () => void;
  readonly onLikeClick: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

/**
 * 데스크톱 행사 카드 — 큰 썸네일 위에 좋아요, 아래에 제목·기간·지역·태그.
 * 관리자는 좋아요 대신 같은 자리에 수정·삭제 메뉴가 뜬다.
 */
function FestivalDesktopCard({
  image,
  title,
  startDate,
  endDate,
  regionName,
  tags,
  isAdmin,
  liked,
  onClick,
  onLikeClick,
  onEdit,
  onDelete,
}: FestivalDesktopCardProps) {
  return (
    <article className="relative flex flex-col gap-[16px]">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col gap-[16px] text-left"
      >
        <span
          style={{ height: IMAGE_HEIGHT }}
          className="bg-gray-2 block w-full overflow-hidden rounded-[12px]"
        >
          {image ? (
            <img
              src={image}
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : null}
        </span>

        <span className="flex flex-col gap-[16px]">
          <span className="flex flex-col gap-[8px]">
            <span className="truncate text-[20px] leading-[1.5] font-medium text-black">
              {title}
            </span>
            <span className="text-gray-4 flex items-center gap-[8px] text-[16px] font-medium whitespace-nowrap">
              <span className="flex items-center gap-[2px]">
                <MdCalendarToday aria-hidden="true" className="text-[18px]" />
                {startDate} ~ {endDate}
              </span>
              <span className="flex min-w-0 items-center gap-[2px]">
                <MdLocationOn aria-hidden="true" className="text-[18px]" />
                {regionName}
              </span>
            </span>
          </span>

          {tags.length > 0 ? (
            <span className="flex items-center gap-[8px]">
              {tags.slice(0, MAX_TAGS).map((tag) => (
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
      </button>

      {isAdmin ? (
        <CardActionMenu
          onEdit={onEdit}
          onDelete={onDelete}
          triggerClassName="absolute top-[16px] right-[16px]"
          triggerSize={LIKE_SIZE}
          ariaLabel={`${title} 행사 메뉴`}
        />
      ) : (
        <button
          type="button"
          aria-label={liked ? `${title} 좋아요 취소` : `${title} 좋아요`}
          aria-pressed={liked}
          onClick={onLikeClick}
          className="absolute top-[16px] right-[16px]"
        >
          <img
            src={liked ? oheart : heart}
            alt=""
            draggable={false}
            style={{ width: LIKE_SIZE, height: LIKE_SIZE }}
          />
        </button>
      )}
    </article>
  );
}

export default FestivalDesktopCard;
