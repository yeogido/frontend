import type { IconType } from 'react-icons';
import { MdCalendarToday, MdLocationOn, MdPerson } from 'react-icons/md';

import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import TagChip, { type TagType } from '../../../components/common/TagChip';

// Figma 1440 데스크톱 시안(6242:29073 코스 카드) 기준 리터럴 px.
const DEFAULT_IMAGE_HEIGHT = 172;
const LIKE_SIZE = 28;
const TAG_HEIGHT = 25;
const MAX_TAGS = 3;

interface CourseDesktopCardProps {
  readonly image: string | null;
  readonly title: string;
  readonly duration: string;
  readonly courseType: string;
  readonly companion: string;
  readonly tags: readonly TagType[];
  readonly liked: boolean;
  readonly onClick: () => void;
  readonly onLikeClick: () => void;
  /** 상세의 2열 미리보기는 172, 전체 목록의 3열은 236. */
  readonly imageHeight?: number;
}

function InfoText({
  icon: Icon,
  text,
}: {
  readonly icon: IconType;
  readonly text: string;
}) {
  if (!text) return null;

  return (
    <span className="flex items-center gap-[2px]">
      <Icon aria-hidden="true" className="text-[16px]" />
      {text}
    </span>
  );
}

/** 코스 카드 — 경로 이미지 위에 좋아요, 아래에 제목·기간·이동수단·동행·태그. */
function CourseDesktopCard({
  image,
  title,
  duration,
  courseType,
  companion,
  tags,
  liked,
  onClick,
  onLikeClick,
  imageHeight = DEFAULT_IMAGE_HEIGHT,
}: CourseDesktopCardProps) {
  return (
    <article className="relative">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-col gap-[16px] text-left"
      >
        <span
          style={{ height: imageHeight }}
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

        <span className="flex flex-col gap-[12px]">
          <span className="flex flex-col gap-[8px]">
            <span className="truncate text-[20px] leading-[1.5] font-medium text-black">
              {title}
            </span>
            <span className="text-gray-4 flex items-center gap-[8px] text-[16px] font-medium whitespace-nowrap">
              <InfoText icon={MdCalendarToday} text={duration} />
              <InfoText icon={MdLocationOn} text={courseType} />
              <InfoText icon={MdPerson} text={companion} />
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
    </article>
  );
}

export default CourseDesktopCard;
