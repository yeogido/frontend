import { MdCalendarToday, MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { useCultureContents } from '../../../hooks/useCultureContents';
import { buildFestivalDetailPath } from '../../../utils/routes';
import HomeSectionHeader from './HomeSectionHeader';

// Figma 1440 데스크톱 시안(6089:34672 card_event) 기준 리터럴 px.
const PREVIEW_COUNT = 4;
const CARD_WIDTH = 244;
const CARD_HEIGHT = 355;

/** 진행 중인 행사 — 큰 사진 위에 제목·기간·지역을 얹은 카드 4개. */
function HomeFestivalSection() {
  const navigate = useNavigate();
  const { data, isPending, isError } = useCultureContents({
    statuses: ['ONGOING'],
    sort: 'RECOMMEND',
    size: PREVIEW_COUNT,
  });
  const festivals = (data?.pages[0]?.items ?? []).slice(0, PREVIEW_COUNT);

  return (
    <section aria-label="진행 중인 행사" className="flex flex-col gap-[20px]">
      <HomeSectionHeader
        title="진행 중인 행사"
        onMoreClick={() => navigate('/festival')}
      />

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
            : festivals.map((festival) => (
                <li key={festival.contentId}>
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
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/70 to-transparent"
                    />
                    <span className="absolute inset-x-[16px] bottom-[16px] flex flex-col gap-[8px] text-white">
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
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}

export default HomeFestivalSection;
