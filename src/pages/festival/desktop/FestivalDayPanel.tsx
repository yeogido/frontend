import { MdLocationOn } from 'react-icons/md';

import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import TagChip, { type TagType } from '../../../components/common/TagChip';

// Figma 1440 데스크톱 시안(6370:67272) 기준 리터럴 px.
const THUMBNAIL_WIDTH = 136;
const THUMBNAIL_HEIGHT = 100;
const TAG_HEIGHT = 25;
const LIKE_SIZE = 24;
const MAX_TAGS = 3;

export interface FestivalDayPanelItem {
  readonly id: number;
  readonly image: string | null;
  readonly title: string;
  readonly regionName: string;
  readonly tags: readonly TagType[];
  readonly liked: boolean;
  /** 관리자는 좋아요를 쓰지 않는다. */
  readonly canLike: boolean;
}

interface FestivalDayPanelProps {
  /** 'YYYY-MM-DD' */
  readonly selectedDate: string;
  readonly items: readonly FestivalDayPanelItem[];
  readonly isPending: boolean;
  readonly onItemClick: (id: number) => void;
  readonly onLikeClick: (id: number) => void;
}

function toDateTitle(date: string) {
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));

  return `${month}월 ${day}일, 이런 행사 어때요?`;
}

/** 달력에서 고른 날짜에 열리는 행사 추천(최대 3개). */
function FestivalDayPanel({
  selectedDate,
  items,
  isPending,
  onItemClick,
  onLikeClick,
}: FestivalDayPanelProps) {
  return (
    <section
      aria-label="선택한 날짜의 행사"
      className="bg-background flex flex-col gap-[24px] rounded-[24px] px-[24px] py-[20px]"
    >
      <h2 className="text-[18px] font-semibold text-black">
        {toDateTitle(selectedDate)}
      </h2>

      {isPending ? (
        <p className="text-gray-4 text-[16px]">불러오는 중이에요.</p>
      ) : items.length === 0 ? (
        <p className="text-gray-4 text-[16px] font-medium">
          이 날 열리는 행사가 없어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-[19px]">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between">
              <button
                type="button"
                onClick={() => onItemClick(item.id)}
                className="flex min-w-0 items-center gap-[12px] text-left"
              >
                <span
                  style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
                  className="bg-gray-2 block shrink-0 overflow-hidden rounded-[12px]"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>

                <span className="flex min-w-0 flex-col gap-[16px]">
                  <span className="flex min-w-0 flex-col gap-[4px]">
                    <span className="truncate text-[20px] font-medium text-black">
                      {item.title}
                    </span>
                    <span className="text-gray-4 flex items-center gap-[2px] text-[16px] whitespace-nowrap">
                      <MdLocationOn
                        aria-hidden="true"
                        className="text-[18px]"
                      />
                      {item.regionName}
                    </span>
                  </span>
                  {item.tags.length > 0 ? (
                    <span className="flex items-center gap-[4px]">
                      {item.tags.slice(0, MAX_TAGS).map((tag) => (
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

              {item.canLike ? (
                <button
                  type="button"
                  aria-label={
                    item.liked
                      ? `${item.title} 좋아요 취소`
                      : `${item.title} 좋아요`
                  }
                  aria-pressed={item.liked}
                  onClick={() => onLikeClick(item.id)}
                  className="shrink-0"
                >
                  <img
                    src={item.liked ? oheart : heart}
                    alt=""
                    draggable={false}
                    style={{ width: LIKE_SIZE, height: LIKE_SIZE }}
                  />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default FestivalDayPanel;
