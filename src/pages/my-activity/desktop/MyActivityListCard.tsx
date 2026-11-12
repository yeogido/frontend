import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

import TagChip, { type TagType } from '../../../components/common/TagChip';

// Figma 1440 데스크톱 시안(5745:32332 card_mypage) 기준 리터럴 px.
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 111;
const TAG_HEIGHT = 26;

export interface ActivityInfoItem {
  readonly icon: IconType;
  readonly text: string;
}

interface MyActivityListCardProps {
  readonly image: string | null;
  readonly title: string;
  readonly info: readonly ActivityInfoItem[];
  /** 장소 카드처럼 태그 대신 아래쪽에 따로 붙는 한 줄(현위치와의 거리). */
  readonly extraInfo?: ActivityInfoItem;
  readonly tags?: readonly TagType[];
  /** 오른쪽 끝 동작(좋아요 해제, 더보기 메뉴 등). */
  readonly action?: ReactNode;
  readonly onClick: () => void;
}

function InfoText({ icon: Icon, text }: ActivityInfoItem) {
  return (
    <span className="text-gray-4 flex items-center gap-[2px] text-[14px] whitespace-nowrap">
      <Icon aria-hidden="true" className="text-[14px]" />
      {text}
    </span>
  );
}

/**
 * 내 활동 목록의 한 줄 카드 — 왼쪽 썸네일, 가운데 정보, 오른쪽 동작.
 * 카드 본문은 하나의 버튼이고, 동작 영역은 그 밖에 둬서 중첩 버튼을 피한다.
 */
function MyActivityListCard({
  image,
  title,
  info,
  extraInfo,
  tags = [],
  action,
  onClick,
}: MyActivityListCardProps) {
  const hasTags = tags.length > 0;

  return (
    <article className="border-gray-2 flex items-start justify-between border-b py-[20px]">
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 items-center gap-[24px] text-left"
      >
        <span
          style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
          className="bg-gray-2 block shrink-0 overflow-hidden rounded-[12px]"
        >
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : null}
        </span>

        <span
          style={{ minHeight: THUMBNAIL_HEIGHT }}
          className={`flex min-w-0 flex-col ${
            hasTags ? 'gap-[24px]' : 'justify-between py-[8px]'
          }`}
        >
          <span className="flex min-w-0 flex-col gap-[8px]">
            <span className="truncate text-[18px] font-medium text-black">
              {title}
            </span>
            <span className="flex items-center gap-[8px]">
              {info.map((item) => (
                <InfoText key={item.text} {...item} />
              ))}
            </span>
          </span>

          {hasTags ? (
            <span className="flex items-center gap-[8px]">
              {tags.map((tag) => (
                <TagChip
                  key={tag}
                  type={tag}
                  className="w-auto"
                  style={{ height: TAG_HEIGHT }}
                />
              ))}
            </span>
          ) : null}

          {extraInfo ? <InfoText {...extraInfo} /> : null}
        </span>
      </button>

      {action ? (
        <div className="flex shrink-0 items-center">{action}</div>
      ) : null}
    </article>
  );
}

export default MyActivityListCard;
