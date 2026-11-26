import type { ReactNode } from 'react';
import { MdCalendarToday, MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useCultureContents } from '../../../hooks/useCultureContents';
import type { ContentCategory, ContentSort } from '../../../types/content.type';
import { buildFestivalDetailPath } from '../../../utils/routes';
import HomeSectionHeader from './HomeSectionHeader';

// Figma 1440 데스크톱 시안(6089:34672 card_event) 기준 리터럴 px.
const PREVIEW_COUNT = 4;
const CARD_WIDTH = 244;
const CARD_HEIGHT = 355;

interface HomeFestivalSectionProps {
  readonly title?: string;
  /** 지역 결과 화면에서 한 지역의 행사만 보여줄 때 쓴다. */
  readonly regionId?: number;
  /** regionId를 못 찾은 지역은 지역명을 키워드로 대신 검색한다. */
  readonly keyword?: string;
  /** 지역을 확인하는 동안 요청을 미룰 때 false. */
  readonly enabled?: boolean;
  readonly moreTo?: string;
  /** 지역 결과 화면의 분류·정렬 필터. 홈은 쓰지 않는다. */
  readonly category?: ContentCategory;
  readonly sort?: ContentSort;
  readonly latitude?: number;
  readonly longitude?: number;
  /** 제목 줄과 카드 사이에 놓을 필터 줄. */
  readonly toolbar?: ReactNode;
}

/** 진행 중인 행사 — 큰 사진 위에 제목·기간·지역을 얹은 카드 4개. */
function HomeFestivalSection({
  title = '진행 중인 행사',
  regionId,
  keyword,
  enabled = true,
  moreTo = '/festival',
  category,
  sort = 'RECOMMEND',
  latitude,
  longitude,
  toolbar,
}: HomeFestivalSectionProps) {
  const navigate = useNavigate();
  const { getLiked, toggleLike } = useContentLikeToggle();
  const { data, isPending, isError } = useCultureContents(
    {
      regionId,
      keyword,
      statuses: ['ONGOING'],
      category,
      sort,
      latitude,
      longitude,
      size: PREVIEW_COUNT,
    },
    { enabled }
  );
  const festivals = (data?.pages[0]?.items ?? []).slice(0, PREVIEW_COUNT);

  return (
    <section aria-label={title} className="flex flex-col gap-[20px]">
      <HomeSectionHeader title={title} onMoreClick={() => navigate(moreTo)} />
      {toolbar}

      {isError ? (
        <p role="alert" className="text-main-5 text-[16px] font-medium">
          행사 목록을 불러오지 못했어요.
        </p>
      ) : (
        <ul className="flex gap-[24px]">
          {isPending
            ? Array.from({ length: PREVIEW_COUNT }, (_, index) => (
                <li
                  key={index}
                  aria-hidden="true"
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                  className="bg-gray-2 animate-pulse rounded-[12px]"
                />
              ))
            : festivals.map((festival) => {
                const liked = getLiked(festival.contentId, festival.isLiked);

                return (
                  <li key={festival.contentId} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(buildFestivalDetailPath(festival.contentId))
                      }
                      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                      className="bg-gray-2 relative block overflow-hidden rounded-[12px] text-left"
                    >
                      {festival.thumbnailImageUrl ? (
                        <img
                          src={festival.thumbnailImageUrl}
                          alt=""
                          draggable={false}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : null}
                      <span className="absolute inset-x-0 bottom-0 flex h-[120px] flex-col justify-center gap-[8px] bg-[rgba(146,146,146,0.5)] px-[16px] text-white backdrop-blur-[21.2px]">
                        <span className="truncate text-[18px] font-semibold">
                          {festival.title}
                        </span>
                        <span className="flex items-center gap-[4px] text-[14px]">
                          <MdCalendarToday aria-hidden="true" />
                          {festival.startDate} ~ {festival.endDate}
                        </span>
                        <span className="flex items-center gap-[4px] text-[14px]">
                          <MdLocationOn aria-hidden="true" />
                          {festival.regionName}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={
                        liked
                          ? `${festival.title} 좋아요 취소`
                          : `${festival.title} 좋아요`
                      }
                      aria-pressed={liked}
                      onClick={() => toggleLike(festival.contentId, liked)}
                      className="absolute top-[12px] right-[12px]"
                    >
                      <img
                        src={liked ? oheart : heart}
                        alt=""
                        draggable={false}
                        className="h-[24px] w-[24px]"
                      />
                    </button>
                  </li>
                );
              })}
        </ul>
      )}
    </section>
  );
}

export default HomeFestivalSection;
