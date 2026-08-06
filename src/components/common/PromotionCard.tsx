import heart from '../../assets/icons/heart.svg';
import location from '../../assets/icons/location.svg';
import oheart from '../../assets/icons/oheart.svg';

import { useScaleFrame } from '../../hooks/useScaleFrame';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px.
// 개별 scale 계산 대신 useScaleFrame이 전체를 한 번에 scale한다.
const CARD_DESIGN_WIDTH = 342;
const HEART_SIZE = 16;
const HEART_TOP = 8;
const HEART_RIGHT = 8;

const AVATAR_SIZE = 40;
const PROFILE_GAP = 8;
const HEADER_PADDING_X = 12;
const HEADER_PADDING_TOP = 12;
const HEADER_PADDING_BOTTOM = 8;
// 프로필 헤더(아바타+이름/날짜) 블록의 실제 렌더 높이. 좋아요 버튼이
// 카드 전체 기준 좌표로 옮겨가면서, 이미지 상단이 아니라 이 높이만큼
// 아래에서부터 HEART_TOP을 더해야 원래와 같은 위치(이미지 우상단)에 온다.
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

export interface PromotionCardProps {
  avatarUrl: string;
  profileName: string;
  date: string;
  imageUrl: string;
  title: string;
  description: string;
  location: string;
  liked?: boolean;
  onClick?: () => void;
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
  liked = false,
  onClick,
  onLikeClick,
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
      {/* 카드 이동(role="button")과 좋아요 버튼을 형제 컨트롤로 분리하기
          위한 래퍼. transform/너비는 원래 카드 요소가 갖던 것을 그대로
          옮겨왔고, useScaleFrame의 innerRef는 안쪽 카드 요소(w-full)에
          둬서 offsetHeight 계산(콘텐츠 높이 그대로)에는 영향이 없다. */}
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
            if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              onClick?.();
            }
          }}
          role="button"
          tabIndex={0}
          className="flex w-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        >
          {/* Profile header */}
          <div
            className="flex items-center"
            style={{
              gap: PROFILE_GAP,
              paddingLeft: HEADER_PADDING_X,
              paddingRight: HEADER_PADDING_X,
              paddingTop: HEADER_PADDING_TOP,
              paddingBottom: HEADER_PADDING_BOTTOM,
            }}
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
                className="truncate font-semibold leading-none text-[#1C1C1C]"
                style={{ fontSize: NAME_SIZE }}
              >
                {profileName}
              </p>

              <p
                className="font-normal leading-none text-[#7F7F7F]"
                style={{ fontSize: DATE_SIZE, marginTop: DATE_GAP }}
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
              className="font-semibold leading-tight text-[#1C1C1C]"
              style={{ fontSize: TITLE_SIZE }}
            >
              {title}
            </h2>

            <p
              className="line-clamp-2 font-normal leading-[1.45] text-[#7F7F7F]"
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
                  className="font-medium leading-none text-[#7F7F7F]"
                  style={{ fontSize: LOCATION_TEXT_SIZE }}
                >
                  {locationText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {onLikeClick && (
          <button
            type="button"
            onClick={() => onLikeClick()}
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
        )}
      </div>
    </div>
  );
}

export default PromotionCard;
