import { MdLocationOn } from 'react-icons/md';

import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import CardActionMenu from '../../../components/common/CardActionMenu';
import TagChip from '../../../components/common/TagChip';
import type { BusinessItem } from '../types';

// Figma 1440 데스크톱 시안(6336:75105 card) 기준 리터럴 px.
const IMAGE_HEIGHT = 236;
const ICON_SIZE = 28;
const TAG_HEIGHT = 25;
const MAX_TAGS = 3;

interface BusinessDesktopCardProps {
  readonly business: BusinessItem;
  readonly onClick: () => void;
  readonly onLikeClick: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

/**
 * 소상공인 홍보 카드 — 큰 사진 위에 좋아요, 아래에 가게명·지역·태그.
 * 내가 올린 글이면 좋아요 대신 수정·삭제 메뉴가 뜬다.
 */
function BusinessDesktopCard({
  business,
  onClick,
  onLikeClick,
  onEdit,
  onDelete,
}: BusinessDesktopCardProps) {
  return (
    <article className="relative">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-col gap-[16px] text-left"
      >
        <span
          style={{ height: IMAGE_HEIGHT }}
          className="bg-gray-2 block w-full overflow-hidden rounded-[12px]"
        >
          {business.image ? (
            <img
              src={business.image}
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : null}
        </span>

        <span className="flex flex-col gap-[16px]">
          <span className="flex flex-col gap-[8px]">
            <span className="truncate text-[20px] leading-[1.5] font-medium text-black">
              {business.title}
            </span>
            <span className="text-gray-4 flex items-center gap-[2px] text-[16px] font-medium">
              <MdLocationOn aria-hidden="true" className="text-[18px]" />
              {business.location}
            </span>
          </span>

          {business.tags.length > 0 ? (
            <span className="flex items-center gap-[8px]">
              {business.tags.slice(0, MAX_TAGS).map((tag) => (
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

      {business.isMine ? (
        <CardActionMenu
          onEdit={onEdit}
          onDelete={onDelete}
          triggerClassName="absolute top-[16px] right-[16px]"
          triggerSize={ICON_SIZE}
          ariaLabel={`${business.title} 홍보글 메뉴`}
        />
      ) : (
        <button
          type="button"
          aria-label={
            business.liked
              ? `${business.title} 좋아요 취소`
              : `${business.title} 좋아요`
          }
          aria-pressed={business.liked}
          onClick={onLikeClick}
          className="absolute top-[16px] right-[16px]"
        >
          <img
            src={business.liked ? oheart : heart}
            alt=""
            draggable={false}
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
          />
        </button>
      )}
    </article>
  );
}

export default BusinessDesktopCard;
