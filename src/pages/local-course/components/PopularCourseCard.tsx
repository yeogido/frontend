import calendar from '../../../assets/icons/calendar.svg';
import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import people from '../../../assets/icons/people.svg';
import profilePlaceholder from '../../../assets/icons/profile.svg';

import { CardActionMenu } from '../../../components/common';
import TagChip, { type TagType } from '../../../components/common/TagChip';
import { useScaleFrame } from '../../../hooks/useScaleFrame';
import { useVisibleItemCount } from '../../../hooks/useVisibleItemCount';
import { getCompanionIcon } from '../../../utils/companionIcon';

// Figma 390 디자인 기준 리터럴 px. PromotionCard(작성자 헤더)와
// CourseCard(코스 정보 줄 + 태그)의 기존 레이아웃 값을 그대로 가져와 쓴다.
const CARD_DESIGN_WIDTH = 342;
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

const IMAGE_HEIGHT = 228;
const HEART_SIZE = 20;
const HEART_TOP = 12;
const HEART_RIGHT = 12;

const BODY_PADDING_X = 16;
const BODY_PADDING_TOP = 12;
const BODY_PADDING_BOTTOM = 16;
const TITLE_SIZE = 16;
const INFO_MARGIN_TOP = 8;
const INFO_GAP = 4;
const ICON_SIZE = 14;
const ICON_GAP = 2;
const INFO_SIZE = 12;
const TAG_MARGIN_TOP = 12;
const TAG_HEIGHT = 20;
const TAG_GAP = 4;

export interface PopularCourseCardProps {
  /** 작성자 프로필 사진이 없으면 null — 기본 아이콘으로 대체한다. */
  authorAvatarUrl: string | null;
  authorName: string;
  date: string;
  image: string | null;
  title: string;
  duration: string;
  companion: string;
  tags: TagType[];
  liked?: boolean;
  isMine?: boolean;
  onClick?: () => void;
  onLikeClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

/** "인기 추천 코스" 미리보기 전용 큰 카드. 작성자 정보(아바타/닉네임/날짜)가 있다는 점만
 * PromotionCard와 같고, 본문은 CourseCard/ContentCard의 코스 정보·태그 구성을 따른다. */
function PopularCourseCard({
  authorAvatarUrl,
  authorName,
  date,
  image,
  title,
  duration,
  companion,
  tags,
  liked = false,
  isMine = false,
  onClick,
  onLikeClick,
  onEditClick,
  onDeleteClick,
}: PopularCourseCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  const metaItems = [
    { key: 'duration', icon: calendar, label: duration },
  ].filter((item) => Boolean(item.label));
  const metaKey = metaItems.map((item) => item.label).join('|');

  const tagsKey = tags.join('|');
  const {
    containerRef: tagContainerRef,
    hiddenRef: hiddenTagRef,
    visibleCount: visibleTagCount,
  } = useVisibleItemCount(tagsKey, tags.length);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
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
            if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) {
              return;
            }

            event.preventDefault();
            onClick();
          }}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          className={`flex w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)] ${onClick ? 'cursor-pointer' : ''}`}
        >
          {/* 작성자 정보 */}
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
              src={authorAvatarUrl ?? profilePlaceholder}
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
                {authorName}
              </p>
              <p
                className="leading-none font-normal text-[#7F7F7F]"
                style={{ fontSize: DATE_SIZE, marginTop: DATE_GAP }}
              >
                {date}
              </p>
            </div>
          </div>

          {/* 코스 대표 사진 */}
          <div className="relative">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full object-cover"
                style={{ height: IMAGE_HEIGHT }}
              />
            ) : (
              <div
                className="w-full bg-[#EAEAEA]"
                style={{ height: IMAGE_HEIGHT }}
              />
            )}
          </div>

          {/* 코스 정보 */}
          <div
            style={{
              paddingLeft: BODY_PADDING_X,
              paddingRight: BODY_PADDING_X,
              paddingTop: BODY_PADDING_TOP,
              paddingBottom: BODY_PADDING_BOTTOM,
            }}
          >
            <h3
              className="truncate leading-none font-medium text-[#1C1C1C]"
              style={{ fontSize: TITLE_SIZE }}
            >
              {title}
            </h3>

            <div
              key={metaKey}
              className="flex flex-nowrap items-center overflow-hidden"
              style={{ marginTop: INFO_MARGIN_TOP, gap: INFO_GAP * 2 }}
            >
              {metaItems.map((item) => (
                <div
                  key={item.key}
                  className="flex shrink-0 items-center"
                  style={{ height: ICON_SIZE, gap: ICON_GAP }}
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    style={{ width: ICON_SIZE, height: ICON_SIZE }}
                  />
                  <span
                    className="truncate leading-none font-medium text-[#7F7F7F]"
                    style={{ fontSize: INFO_SIZE }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}

              {companion ? (
                <div
                  className="flex shrink-0 items-center"
                  style={{ height: ICON_SIZE, gap: ICON_GAP }}
                >
                  {(() => {
                    const CompanionIcon = getCompanionIcon(companion);
                    return CompanionIcon ? (
                      <span
                        className="flex shrink-0 items-center justify-center text-[#7F7F7F]"
                        style={{ height: ICON_SIZE, width: ICON_SIZE }}
                        aria-hidden="true"
                      >
                        <CompanionIcon style={{ fontSize: 11 }} />
                      </span>
                    ) : (
                      <img
                        src={people}
                        alt=""
                        aria-hidden="true"
                        style={{ width: ICON_SIZE, height: ICON_SIZE }}
                      />
                    );
                  })()}
                  <span
                    className="truncate leading-none font-medium text-[#7F7F7F]"
                    style={{ fontSize: INFO_SIZE }}
                  >
                    {companion}
                  </span>
                </div>
              ) : null}
            </div>

            {tags.length > 0 ? (
              <>
                <div
                  ref={hiddenTagRef}
                  className="invisible absolute flex"
                  style={{ gap: TAG_GAP }}
                  aria-hidden="true"
                >
                  {tags.map((tag, index) => (
                    <TagChip
                      key={`measure-${tag}-${index}`}
                      type={tag}
                      className="w-auto"
                      style={{ height: TAG_HEIGHT }}
                    />
                  ))}
                </div>

                <div
                  ref={tagContainerRef}
                  className="flex flex-nowrap items-center overflow-hidden"
                  style={{ marginTop: TAG_MARGIN_TOP, gap: TAG_GAP }}
                >
                  {tags.slice(0, visibleTagCount).map((tag, index) => (
                    <TagChip
                      key={`${tag}-${index}`}
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

        {isMine && (onEditClick || onDeleteClick) ? (
          // Tailwind는 arbitrary value 클래스를 빌드 시점에 소스에서 문자
          // 그대로 찾아야 해서(런타임 보간 불가), PROFILE_HEADER_HEIGHT(60)
          // + HEART_TOP(12) 값을 리터럴로 직접 적는다 — EditableContentCard의
          // triggerClassName="absolute top-[8px] right-[8px]"와 같은 방식.
          <CardActionMenu
            onEdit={onEditClick}
            onDelete={onDeleteClick}
            triggerClassName="absolute top-[72px] right-[12px]"
            ariaLabel="코스 메뉴"
          />
        ) : onLikeClick ? (
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

export default PopularCourseCard;
