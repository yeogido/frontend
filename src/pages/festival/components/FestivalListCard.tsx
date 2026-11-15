import calendar from '../../../assets/icons/calendar.svg';
import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import { CardActionMenu, TagChip } from '../../../components/common';
import type { TagType } from '../../../components/common/TagChip';
import { useScaleFrame } from '../../../hooks/useScaleFrame';
import { useVisibleItemCount } from '../../../hooks/useVisibleItemCount';

// 모든 수치는 Figma 390 디자인 기준(카드 자체 폭 342) 리터럴 px
const CARD_DESIGN_WIDTH = 342;
const CARD_HEIGHT = 100;
const IMAGE_WIDTH = 134;
const HEART_SIZE = 16;
const ACTION_SIZE = 20;
const TAG_HEIGHT = 20;
const TAG_GAP = 4;

interface FestivalListCardProps {
  image: string | null;
  title: string;
  startDate: string;
  endDate: string;
  tags: TagType[];
  /** 관리자면 좋아요 대신 같은 자리에 수정/삭제 메뉴를 띄운다. */
  isAdmin: boolean;
  liked: boolean;
  onClick: () => void;
  onLikeClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** 행사 일정(달력) 보기의 가로형 행사 카드. 사진 왼쪽, 정보 오른쪽. */
function FestivalListCard({
  image,
  title,
  startDate,
  endDate,
  tags,
  isAdmin,
  liked,
  onClick,
  onLikeClick,
  onEdit,
  onDelete,
}: FestivalListCardProps) {
  const { outerRef, innerRef, scale } = useScaleFrame(CARD_DESIGN_WIDTH);
  const {
    containerRef: visibleContainerRef,
    hiddenRef: hiddenContainerRef,
    visibleCount,
  } = useVisibleItemCount(tags.join('|'), tags.length);

  return (
    <div
      ref={outerRef}
      className="w-full shrink-0"
      style={{ height: CARD_HEIGHT * scale }}
    >
      <div
        ref={innerRef}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event) => {
          // 좋아요 버튼이나 (포털로 띄워도 React 트리로는 버블링되는) 수정/삭제
          // 메뉴에서 누른 키까지 받으면 그 동작 대신 상세로 이동해 버린다.
          if (event.target !== event.currentTarget) return;
          if (event.key !== 'Enter' && event.key !== ' ') return;

          event.preventDefault();
          onClick();
        }}
        className="relative flex cursor-pointer overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full shrink-0 rounded-[8px] object-cover"
            style={{ width: IMAGE_WIDTH }}
          />
        ) : (
          <div
            className="h-full shrink-0 rounded-[8px] bg-[#EAEAEA]"
            style={{ width: IMAGE_WIDTH }}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col pt-[15px] pr-9 pb-[14px] pl-3">
          <h3 className="truncate text-[14px] leading-none font-medium text-[#1C1C1C]">
            {title}
          </h3>

          <div className="mt-2 flex h-[14px] items-center gap-0.5">
            <span
              aria-hidden="true"
              className="flex size-[14px] shrink-0 items-center justify-center"
            >
              <img src={calendar} alt="" />
            </span>
            <span className="min-w-0 truncate text-[12px] leading-none font-medium text-[#7F7F7F]">
              {`${startDate} ~ ${endDate}`}
            </span>
          </div>

          {tags.length > 0 ? (
            <>
              <div
                ref={hiddenContainerRef}
                aria-hidden="true"
                className="invisible absolute flex"
                style={{ gap: TAG_GAP }}
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
                ref={visibleContainerRef}
                className="mt-auto -mr-6 flex flex-nowrap items-center overflow-hidden"
                style={{ gap: TAG_GAP }}
              >
                {tags.slice(0, visibleCount).map((tag, index) => (
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

        {isAdmin ? (
          <CardActionMenu
            onEdit={onEdit}
            onDelete={onDelete}
            triggerSize={ACTION_SIZE}
            triggerClassName="absolute top-3 right-3"
            ariaLabel="행사 카드 메뉴"
          />
        ) : (
          <button
            type="button"
            aria-label={liked ? '좋아요 취소' : '좋아요'}
            aria-pressed={liked}
            onClick={(event) => {
              event.stopPropagation();
              onLikeClick();
            }}
            className="absolute top-[14px] right-3 flex items-center justify-center"
            style={{ width: HEART_SIZE, height: HEART_SIZE }}
          >
            <img
              src={liked ? oheart : heart}
              alt=""
              style={{ width: HEART_SIZE, height: HEART_SIZE }}
            />
          </button>
        )}
      </div>
    </div>
  );
}

export function FestivalListCardSkeleton() {
  const { outerRef, innerRef, scale } = useScaleFrame(CARD_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      aria-hidden="true"
      className="w-full shrink-0"
      style={{ height: CARD_HEIGHT * scale }}
    >
      <div
        ref={innerRef}
        className="flex animate-pulse overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          className="h-full shrink-0 rounded-[8px] bg-[#EAEAEA]"
          style={{ width: IMAGE_WIDTH }}
        />
        <div className="flex flex-1 flex-col pt-[15px] pb-[14px] pl-3">
          <div className="h-[14px] w-24 rounded bg-[#EAEAEA]" />
          <div className="mt-2 h-3 w-32 rounded bg-[#EAEAEA]" />
          <div className="mt-auto flex gap-1">
            <div className="h-5 w-12 rounded-full bg-[#EAEAEA]" />
            <div className="h-5 w-12 rounded-full bg-[#EAEAEA]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FestivalListCard;
