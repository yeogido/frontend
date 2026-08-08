import calendar from '../../assets/icons/calendar.svg';
import location from '../../assets/icons/location.svg';
import people from '../../assets/icons/people.svg';

import { useScaleFrame } from '../../hooks/useScaleFrame';
import { useVisibleItemCount } from '../../hooks/useVisibleItemCount';
import { getCompanionIcon } from '../../utils/companionIcon';

import CardActionMenu from './CardActionMenu';
import TagChip, { type TagType } from './TagChip';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px.
// 개별 vw 계산 대신 useScaleFrame이 전체를 한 번에 scale한다.
const CARD_DESIGN_WIDTH = 342;
const CARD_MIN_HEIGHT = 100;
const IMAGE_WIDTH = 136;
const IMAGE_RADIUS = 8;
const CONTENT_PADDING_LEFT = 16;
const CONTENT_PADDING_RIGHT = 42; // fix 버튼(20) + 간격(10) + 카드 우측 여백(12)
const ACTION_SIZE = 20;
const TAG_HEIGHT = 20;
const TAG_GAP = 4;

export interface EditableCourseCardProps {
  image: string;
  title: string;
  duration: string;
  courseType: string;
  companion: string;
  tags: TagType[];
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** 수정/삭제 메뉴가 달린 CourseCard. 목록 소유자 화면(마이페이지 등)에서 좋아요 대신 사용한다. */
function EditableCourseCard({
  image,
  title,
  duration,
  courseType,
  companion,
  tags,
  onClick,
  onEdit,
  onDelete,
}: EditableCourseCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  const metaItems = [
    { key: 'duration', icon: calendar, label: duration },
    { key: 'courseType', icon: location, label: courseType },
    { key: 'companion', icon: people, label: companion },
  ].filter((item) => Boolean(item.label));

  const metaKey = metaItems.map((item) => item.label).join('|');
  const tagsKey = tags.join('|');

  const {
    containerRef: metaContainerRef,
    hiddenRef: hiddenMetaRef,
    visibleCount: visibleMetaCount,
  } = useVisibleItemCount(metaKey, metaItems.length);

  const {
    containerRef: tagContainerRef,
    hiddenRef: hiddenTagRef,
    visibleCount: visibleTagCount,
  } = useVisibleItemCount(tagsKey, tags.length);

  const isClickable = Boolean(onClick);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
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
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={`relative flex overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] ${isClickable ? 'cursor-pointer' : ''}`}
        style={{
          width: CARD_DESIGN_WIDTH,
          minHeight: CARD_MIN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Image: 세로형 원본이 들어와도 카드 높이를 밀어올리지 않도록
            래퍼가 높이를 잡고 img 는 그 안을 채운다. */}
        <div
          className="relative shrink-0 self-stretch overflow-hidden bg-[#EAEAEA]"
          style={{ width: IMAGE_WIDTH, borderRadius: IMAGE_RADIUS }}
        >
          {image && (
            <img
              src={image}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>

        {/* Text column: Figma 스펙대로 제목/메타/태그 모두 동일한 우측 여백(fix 버튼 자리) 공유 */}
        <div
          className="relative flex min-w-0 flex-1 flex-col py-4"
          style={{
            paddingLeft: CONTENT_PADDING_LEFT,
            paddingRight: CONTENT_PADDING_RIGHT,
          }}
        >
          {/* Title */}
          <h3 className="truncate text-[16px] leading-none font-medium text-[#1C1C1C]">
            {title}
          </h3>

          {/* Meta: 측정 전용 hidden 영역 */}
          <div
            ref={hiddenMetaRef}
            className="invisible absolute flex gap-1"
            aria-hidden="true"
          >
            {metaItems.map((item) => (
              <div
                key={`measure-${item.key}`}
                className="flex items-center gap-[2px]"
              >
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-[14px] w-[14px] shrink-0"
                />

                <span className="text-[12px] leading-none font-medium whitespace-nowrap text-[#7F7F7F]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Meta: 실제로 보여지는 부분 */}
          <div
            ref={metaContainerRef}
            className="mt-2 flex flex-nowrap items-center gap-1 overflow-hidden"
          >
            {metaItems.slice(0, visibleMetaCount).map((item) => {
              const CompanionIcon =
                item.key === 'companion' ? getCompanionIcon(item.label) : null;

              return (
                <div
                  key={item.key}
                  className="flex shrink-0 items-center gap-[2px]"
                >
                  {CompanionIcon ? (
                    <span
                      className="flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#7F7F7F]"
                      aria-hidden="true"
                    >
                      <CompanionIcon style={{ fontSize: 11 }} />
                    </span>
                  ) : (
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      className="h-[14px] w-[14px] shrink-0"
                    />
                  )}

                  <span className="text-[12px] leading-none font-medium whitespace-nowrap text-[#7F7F7F]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tags: 측정 전용 hidden 영역 */}
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

          {/* Tags: 실제로 보여지는 태그 */}
          <div
            ref={tagContainerRef}
            className="mt-3 flex flex-nowrap items-center overflow-hidden"
            style={{ gap: TAG_GAP }}
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
        </div>

        <CardActionMenu
          onEdit={onEdit}
          onDelete={onDelete}
          triggerSize={ACTION_SIZE}
          triggerClassName="absolute top-[12px] right-[12px]"
          ariaLabel="코스 메뉴"
        />
      </div>
    </div>
  );
}

export default EditableCourseCard;
