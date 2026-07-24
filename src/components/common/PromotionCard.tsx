import location from '../../assets/icons/location.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
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

const CARD_RADIUS = 12;

export interface PromotionCardProps {
  avatarUrl: string;
  profileName: string;
  date: string;
  imageUrl: string;
  title: string;
  description: string;
  location: string;
  onClick?: () => void;
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
  onClick,
  className = '',
}: PromotionCardProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer flex-col overflow-hidden bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)] ${className}`}
      style={{ borderRadius: CARD_RADIUS * scale }}
    >
      {/* Profile header */}
      <div
        className="flex items-center"
        style={{
          gap: PROFILE_GAP * scale,
          paddingLeft: HEADER_PADDING_X * scale,
          paddingRight: HEADER_PADDING_X * scale,
          paddingTop: HEADER_PADDING_TOP * scale,
          paddingBottom: HEADER_PADDING_BOTTOM * scale,
        }}
      >
        <img
          src={avatarUrl}
          alt=""
          aria-hidden="true"
          className="shrink-0 rounded-full object-cover"
          style={{ width: AVATAR_SIZE * scale, height: AVATAR_SIZE * scale }}
        />

        <div className="min-w-0">
          <p
            className="truncate font-semibold leading-none text-[#1C1C1C]"
            style={{ fontSize: NAME_SIZE * scale }}
          >
            {profileName}
          </p>

          <p
            className="font-normal leading-none text-[#7F7F7F]"
            style={{
              fontSize: DATE_SIZE * scale,
              marginTop: DATE_GAP * scale,
            }}
          >
            {date}
          </p>
        </div>
      </div>

      {/* Image */}
      <img
        src={imageUrl}
        alt={title}
        className="w-full object-cover"
        style={{ height: IMAGE_HEIGHT * scale }}
      />

      {/* Body */}
      <div
        style={{
          paddingLeft: BODY_PADDING_X * scale,
          paddingRight: BODY_PADDING_X * scale,
          paddingTop: BODY_PADDING_TOP * scale,
          paddingBottom: BODY_PADDING_BOTTOM * scale,
        }}
      >
        <h2
          className="font-semibold leading-[1.25] text-[#1C1C1C]"
          style={{ fontSize: TITLE_SIZE * scale }}
        >
          {title}
        </h2>

        <p
          className="line-clamp-2 font-normal leading-[1.45] text-[#7F7F7F]"
          style={{
            fontSize: DESCRIPTION_SIZE * scale,
            marginTop: DESCRIPTION_GAP * scale,
          }}
        >
          {description}
        </p>

        <div style={{ marginTop: LOCATION_GAP * scale }}>
          <div
            className="flex items-center"
            style={{ gap: LOCATION_ICON_GAP * scale }}
          >
            <img
              src={location}
              alt=""
              aria-hidden="true"
              className="shrink-0"
              style={{
                width: LOCATION_ICON_SIZE * scale,
                height: LOCATION_ICON_SIZE * scale,
              }}
            />

            <span
              className="font-medium leading-none text-[#7F7F7F]"
              style={{ fontSize: LOCATION_TEXT_SIZE * scale }}
            >
              {locationText}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default PromotionCard;
