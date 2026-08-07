import location from '../../assets/icons/location.svg';

import { useScaleFrame } from '../../hooks/useScaleFrame';

import ReviewActionMenu from './ReviewActionMenu';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px.
// 개별 scale 계산 대신 useScaleFrame이 전체를 한 번에 scale한다.
const CARD_DESIGN_WIDTH = 342;

const AVATAR_SIZE = 40;
const PROFILE_GAP = 8;
const HEADER_PADDING_X = 12;
const HEADER_PADDING_TOP = 12;
const HEADER_PADDING_BOTTOM = 8;
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

export interface PromotionCardProps {
  avatarUrl: string;
  profileName: string;
  date: string;
  imageUrl: string;
  title: string;
  description: string;
  location: string;
  isMine?: boolean;
  onClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
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
  isMine = false,
  onClick,
  onEditClick,
  onDeleteClick,
  className = '',
}: PromotionCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

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
          if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onClick?.();
          }
        }}
        role="button"
        tabIndex={0}
        className="flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Profile header */}
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

          {isMine ? (
            <ReviewActionMenu
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
            />
          ) : null}
        </div>

        {/* Image */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full object-cover"
          style={{ height: IMAGE_HEIGHT }}
        />

        {/* Body */}
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
        </div>
      </div>
    </div>
  );
}

export default PromotionCard;
