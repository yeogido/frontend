import calendar from '../../assets/icons/calendar.svg';
import location from '../../assets/icons/location.svg';
import near from '../../assets/icons/near.svg';
import people from '../../assets/icons/people.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useVisibleItemCount } from '../../hooks/useVisibleItemCount';
import { getCompanionIcon } from '../../utils/companionIcon';

import CardActionMenu from './CardActionMenu';
import TagChip, { type TagType } from './TagChip';

// 모든 수치는 Figma 390 디자인 기준(카드 자체 폭 163 기준) 리터럴 px
const CARD_DESIGN_WIDTH = 163;
const CARD_HEIGHT = 222;
const IMAGE_HEIGHT = 115;
const CONTENT_HEIGHT = 107;
const CONTENT_PADDING = 8;
const TITLE_SIZE = 14;
const INFO_SIZE = 12;
/** 아이콘 슬롯. 아이콘은 원본 비율 그대로 이 슬롯 가운데에 놓는다(중심 x = 15). */
const ICON_SIZE = 14;
const ICON_GAP = 2;
/** 태그 줄이 없는 카드(장소)는 남는 높이만큼 정보 줄을 넓게 벌린다. */
const INFO_MARGIN_TOP = 8;
const INFO_ROW_GAP = 4;
const INFO_MARGIN_TOP_WIDE = 17;
const INFO_ROW_GAP_WIDE = 8;
const ACTION_SIZE = 16;
const TAG_HEIGHT = 20;
const TAG_GAP = 4;

export interface EditableContentCardProps {
  image: string | null;
  title: string;
  firstInfo: string;
  secondInfo: string;
  /** 두 번째 정보 줄에 함께 붙는 보조 정보(예: 동행 유형). 없으면 렌더링하지 않는다. */
  thirdInfo?: string;
  /** 현 위치 기준 거리 줄(예: '현위치와 314KM'). 없으면 렌더링하지 않는다. */
  distanceInfo?: string;
  className?: string;
  tags?: TagType[];
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** 아이콘은 늘리지 않고 원본 크기 그대로 14px 슬롯 가운데에 놓는다. */
function InfoIcon({ src }: { src: string }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ height: ICON_SIZE, width: ICON_SIZE }}
      aria-hidden="true"
    >
      <img src={src} alt="" />
    </span>
  );
}

/** 수정/삭제 메뉴가 달린 ContentCard. 목록 소유자 화면(마이페이지 등)에서 좋아요 대신 사용한다. */
function EditableContentCard({
  image,
  title,
  firstInfo,
  secondInfo,
  thirdInfo,
  distanceInfo,
  className = '',
  tags,
  onClick,
  onEdit,
  onDelete,
}: EditableContentCardProps) {
  const scale = useGlobalScale();

  const tagsKey = tags?.join('|') ?? '';
  const {
    containerRef: visibleContainerRef,
    hiddenRef: hiddenContainerRef,
    visibleCount,
  } = useVisibleItemCount(tagsKey, tags?.length ?? 0);

  const hasTags = Boolean(tags && tags.length > 0);
  const isClickable = Boolean(onClick);
  const hasCustomWidth = /(?:^|\s)(?:w-|min-w|max-w)/.test(className);

  return (
    <div
      className={`shrink-0 overflow-hidden ${className}`}
      style={{
        width: hasCustomWidth ? undefined : CARD_DESIGN_WIDTH * scale,
        height: CARD_HEIGHT * scale,
      }}
    >
      <div
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
        className={`flex flex-col overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)] ${isClickable ? 'cursor-pointer' : ''} `}
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-[8px]">
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

          <CardActionMenu
            onEdit={onEdit}
            onDelete={onDelete}
            triggerSize={ACTION_SIZE}
            triggerClassName="absolute top-[8px] right-[8px]"
            ariaLabel="카드 메뉴"
          />
        </div>

        {/* Content */}
        <div
          className="flex min-w-0 flex-col"
          style={{ height: CONTENT_HEIGHT, padding: CONTENT_PADDING }}
        >
          {/* Title */}
          <h3
            className="truncate leading-none font-medium text-[#1C1C1C]"
            style={{ fontSize: TITLE_SIZE }}
          >
            {title}
          </h3>

          {/* Info */}
          <div
            className="flex flex-col"
            style={{
              marginTop: hasTags ? INFO_MARGIN_TOP : INFO_MARGIN_TOP_WIDE,
              gap: hasTags ? INFO_ROW_GAP : INFO_ROW_GAP_WIDE,
            }}
          >
            <div
              className="flex items-center"
              style={{ height: ICON_SIZE, gap: ICON_GAP }}
            >
              <InfoIcon src={calendar} />

              <span
                className="min-w-0 truncate leading-none font-medium text-[#7F7F7F]"
                style={{ fontSize: INFO_SIZE }}
              >
                {firstInfo}
              </span>
            </div>

            <div
              className="flex items-center"
              style={{ height: ICON_SIZE, gap: ICON_GAP }}
            >
              <InfoIcon src={location} />

              <span
                className="min-w-0 truncate leading-none font-medium text-[#7F7F7F]"
                style={{ fontSize: INFO_SIZE }}
              >
                {secondInfo}
              </span>

              {thirdInfo ? (
                <>
                  {(() => {
                    const CompanionIcon = getCompanionIcon(thirdInfo);
                    return CompanionIcon ? (
                      <span
                        className="flex shrink-0 items-center justify-center text-[#7F7F7F]"
                        style={{ height: ICON_SIZE, width: ICON_SIZE }}
                        aria-hidden="true"
                      >
                        <CompanionIcon style={{ fontSize: 11 }} />
                      </span>
                    ) : (
                      <InfoIcon src={people} />
                    );
                  })()}

                  <span
                    className="shrink-0 truncate leading-none font-medium text-[#7F7F7F]"
                    style={{ fontSize: INFO_SIZE }}
                  >
                    {thirdInfo}
                  </span>
                </>
              ) : null}
            </div>

            {distanceInfo ? (
              <div
                className="flex items-center"
                style={{ height: ICON_SIZE, gap: ICON_GAP }}
              >
                <InfoIcon src={near} />

                <span
                  className="min-w-0 truncate leading-none font-medium text-[#7F7F7F]"
                  style={{ fontSize: INFO_SIZE }}
                >
                  {distanceInfo}
                </span>
              </div>
            ) : null}
          </div>

          {/* Tags */}
          {hasTags && tags && (
            <>
              <div
                ref={hiddenContainerRef}
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

              <div className="mt-auto border-t border-[#E4E4E4] pt-2">
                <div
                  ref={visibleContainerRef}
                  className="flex flex-nowrap items-center overflow-hidden"
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditableContentCard;
