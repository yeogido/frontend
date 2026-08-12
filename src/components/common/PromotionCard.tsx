import heart from '../../assets/icons/heart.svg';
import location from '../../assets/icons/location.svg';
import oheart from '../../assets/icons/oheart.svg';

import { useScaleFrame } from '../../hooks/useScaleFrame';

import ReviewActionMenu from './ReviewActionMenu';
import TagChip, { type TagType } from './TagChip';

const CARD_DESIGN_WIDTH = 342;
const HEART_SIZE = 16;
const HEART_TOP = 8;
const HEART_RIGHT = 8;

const AVATAR_SIZE = 40;
const PROFILE_GAP = 8;
const HEADER_PADDING_X = 12;
const HEADER_PADDING_TOP = 12;
const HEADER_PADDING_BOTTOM = 8;
const PROFILE_HEADER_HEIGHT =
  HEADER_PADDING_TOP + AVATAR_SIZE + HEADER_PADDING_BOTTOM;
const NAME_SIZE = 14;
const DATE_GAP = 4;
const DATE_SIZE = 12;

const IMAGE_HEIGHT = 266;

const BODY_PADDING_X = 12;
const BODY_PADDING_TOP = 12;
const BODY_PADDING_BOTTOM = 12;
const TITLE_SIZE = 15;
const DESCRIPTION_GAP = 6;
const DESCRIPTION_SIZE = 13;
const LOCATION_GAP = 12;
const LOCATION_ICON_GAP = 6;
const LOCATION_ICON_SIZE = 14;
const LOCATION_TEXT_SIZE = 13;

// Figma Promotion_Card(node 930:9177) 기준: 위치 아래 구분선까지 12,
// 구분선 아래 태그 줄까지 12, 태그칩 높이 25, 태그 사이 간격 12.
const TAGS_DIVIDER_MARGIN_TOP = 12;
const TAGS_MARGIN_TOP = 12;
const TAGS_GAP = 12;
const TAG_HEIGHT = 25;

// compact 변형: Figma Course_Card2(node 3239:48247, property1="홍보글") 기준.
// CourseCard와 같은 342px 카드 폭·136x100 썸네일·42px 우측 여백(더보기 버튼
// 자리) 규격을 그대로 쓴다 — 내 게시물 화면에서 코스·후기 카드와 통일된
// 카드 UI를 쓰기 위한 변형이라, 실제로 같은 수치를 공유한다.
const COMPACT_CARD_MIN_HEIGHT = 100;
const COMPACT_IMAGE_WIDTH = 136;
const COMPACT_IMAGE_RADIUS = 8;
const COMPACT_CONTENT_PADDING_LEFT = 16;
const COMPACT_CONTENT_PADDING_RIGHT = 42; // 더보기(20) + 간격(10) + 카드 우측 여백(12)
const COMPACT_TITLE_SIZE = 16;
const COMPACT_TITLE_DESCRIPTION_GAP = 4;
const COMPACT_DESCRIPTION_SIZE = 12;
const COMPACT_CONTENT_GAP = 15; // 제목/설명 묶음 -> 태그 줄
const COMPACT_TAG_HEIGHT = 20;
const COMPACT_TAG_GAP = 4;

export interface PromotionCardProps {
  avatarUrl?: string;
  profileName?: string;
  date?: string;
  imageUrl: string;
  title: string;
  description: string;
  location?: string;
  tags?: TagType[];
  isMine?: boolean;
  liked?: boolean;
  /**
   * 'default': 프로필(아바타·이름·날짜) 헤더가 있는 기존 카드(우리동네 목록,
   * 지역 추천). 'compact': 헤더 없이 코스 카드와 같은 가로형 레이아웃을
   * 쓰는 변형(내가 등록한 게시물의 홍보글 카드) — 이 화면은 항상 본인 글만
   * 보여줘서 작성자 표시가 필요 없다.
   */
  variant?: 'default' | 'compact';
  onClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onLikeClick?: () => void;
  className?: string;
}

function PromotionCard({
  avatarUrl,
  profileName,
  date,
  imageUrl,
  title,
  description,
  location: locationText,
  tags,
  isMine = false,
  liked = false,
  variant = 'default',
  onClick,
  onEditClick,
  onDeleteClick,
  onLikeClick,
  className = '',
}: PromotionCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  if (variant === 'compact') {
    return (
      <div
        ref={outerRef}
        className={`w-full overflow-hidden ${className}`}
        style={{ height: scaledHeight }}
      >
        <div
          ref={innerRef}
          onClick={onClick}
          onKeyDown={(event) => {
            if (event.currentTarget !== event.target) return;
            if (
              !event.repeat &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              onClick?.();
            }
          }}
          role="button"
          tabIndex={0}
          className="relative flex cursor-pointer overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
          style={{
            width: CARD_DESIGN_WIDTH,
            minHeight: COMPACT_CARD_MIN_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <div
            className="relative shrink-0 self-stretch overflow-hidden bg-[#EAEAEA]"
            style={{
              width: COMPACT_IMAGE_WIDTH,
              borderRadius: COMPACT_IMAGE_RADIUS,
            }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>

          <div
            className="flex min-w-0 flex-1 flex-col py-4"
            style={{
              paddingLeft: COMPACT_CONTENT_PADDING_LEFT,
              paddingRight: COMPACT_CONTENT_PADDING_RIGHT,
              gap: COMPACT_CONTENT_GAP,
            }}
          >
            <div className="min-w-0">
              <h3
                className="truncate leading-none font-medium text-[#1C1C1C]"
                style={{ fontSize: COMPACT_TITLE_SIZE }}
              >
                {title}
              </h3>
              <p
                className="truncate leading-none font-medium text-[#7F7F7F]"
                style={{
                  fontSize: COMPACT_DESCRIPTION_SIZE,
                  marginTop: COMPACT_TITLE_DESCRIPTION_GAP,
                }}
              >
                {description}
              </p>
            </div>

            {tags && tags.length > 0 ? (
              <div
                className="flex flex-nowrap items-center overflow-hidden"
                style={{ gap: COMPACT_TAG_GAP }}
              >
                {tags.map((tag, index) => (
                  <TagChip
                    key={`${tag}-${index}`}
                    type={tag}
                    className="w-auto"
                    style={{ height: COMPACT_TAG_HEIGHT }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {isMine && (onEditClick || onDeleteClick) ? (
            <ReviewActionMenu
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              triggerClassName="absolute top-[12px] right-[12px]"
              ariaLabel="홍보글 메뉴"
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={outerRef}
      className={`w-full overflow-hidden ${className}`}
      style={{ height: scaledHeight }}
    >
      <div
        className="relative"
        style={{
          width: CARD_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          ref={innerRef}
          onClick={onClick}
          onKeyDown={(event) => {
            if (event.currentTarget !== event.target) return;
            if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              onClick?.();
            }
          }}
          role="button"
          tabIndex={0}
          className="flex w-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        >
          <div
            className="flex items-center justify-between"
            style={{
              paddingLeft: HEADER_PADDING_X,
              paddingRight: HEADER_PADDING_X,
              paddingTop: HEADER_PADDING_TOP,
              paddingBottom: HEADER_PADDING_BOTTOM,
            }}
          >
            <div
              className="flex min-w-0 items-center"
              style={{ gap: PROFILE_GAP }}
            >
              <img
                src={avatarUrl}
                alt=""
                aria-hidden="true"
                className="shrink-0 rounded-full object-cover"
                style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              />

              <div className="min-w-0">
                <p
                  className="truncate leading-none font-semibold text-[#1C1C1C]"
                  style={{ fontSize: NAME_SIZE }}
                >
                  {profileName}
                </p>
                <p
                  className="leading-none font-normal text-[#7F7F7F]"
                  style={{ fontSize: DATE_SIZE, marginTop: DATE_GAP }}
                >
                  {date}
                </p>
              </div>
            </div>

            {isMine && (onEditClick || onDeleteClick) ? (
              <ReviewActionMenu
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                ariaLabel="홍보글 메뉴"
              />
            ) : null}
          </div>

          <img
            src={imageUrl}
            alt={title}
            className="w-full object-cover"
            style={{ height: IMAGE_HEIGHT }}
          />

          <div
            style={{
              paddingLeft: BODY_PADDING_X,
              paddingRight: BODY_PADDING_X,
              paddingTop: BODY_PADDING_TOP,
              paddingBottom: BODY_PADDING_BOTTOM,
            }}
          >
            <h2
              className="leading-tight font-semibold text-[#1C1C1C]"
              style={{ fontSize: TITLE_SIZE }}
            >
              {title}
            </h2>
            <p
              className="line-clamp-2 leading-[1.45] font-normal text-[#7F7F7F]"
              style={{ fontSize: DESCRIPTION_SIZE, marginTop: DESCRIPTION_GAP }}
            >
              {description}
            </p>
            <div style={{ marginTop: LOCATION_GAP }}>
              <div
                className="flex items-center"
                style={{ gap: LOCATION_ICON_GAP }}
              >
                <img
                  src={location}
                  alt=""
                  aria-hidden="true"
                  className="shrink-0"
                  style={{
                    width: LOCATION_ICON_SIZE,
                    height: LOCATION_ICON_SIZE,
                  }}
                />
                <span
                  className="leading-none font-medium text-[#7F7F7F]"
                  style={{ fontSize: LOCATION_TEXT_SIZE }}
                >
                  {locationText}
                </span>
              </div>
            </div>

            {tags && tags.length > 0 ? (
              <>
                <div
                  className="border-t border-[#E4E4E4]"
                  style={{ marginTop: TAGS_DIVIDER_MARGIN_TOP }}
                />
                <div
                  className="flex flex-wrap"
                  style={{ marginTop: TAGS_MARGIN_TOP, gap: TAGS_GAP }}
                >
                  {tags.map((tag) => (
                    <TagChip
                      key={tag}
                      type={tag}
                      className="w-auto"
                      style={{ height: TAG_HEIGHT }}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {!isMine && onLikeClick ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onLikeClick();
            }}
            aria-pressed={liked}
            className="absolute"
            style={{
              right: HEART_RIGHT,
              top: PROFILE_HEADER_HEIGHT + HEART_TOP,
            }}
          >
            <img
              src={liked ? oheart : heart}
              alt="좋아요"
              style={{ height: HEART_SIZE, width: HEART_SIZE }}
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default PromotionCard;
