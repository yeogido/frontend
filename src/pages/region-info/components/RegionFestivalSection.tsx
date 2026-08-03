import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useCultureContents } from '../../../hooks/useCultureContents';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { toContentTagIds } from '../../../utils/contentTags';
import { buildFestivalDetailPath } from '../../../utils/routes';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;
const REGION_FESTIVAL_PREVIEW_COUNT = 2;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;

interface RegionFestivalSectionProps {
  regionName: string;
  regionId?: number;
}

function RegionFestivalSection({
  regionName,
  regionId,
}: RegionFestivalSectionProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const [likedContentIds, setLikedContentIds] = useState<number[]>([]);

  // regionId를 찾지 못한 지역(예: /regions 목록에 없는 지역)은
  // regionId 필터 대신 지역명을 키워드로 검색해 대체한다.
  const { data, isPending, isError, refetch } = useCultureContents({
    regionId,
    keyword: regionId === undefined ? regionName : undefined,
    category: 'FESTIVAL',
    sort: 'RECOMMEND',
    size: REGION_FESTIVAL_PREVIEW_COUNT,
  });

  const festivals = data?.pages[0]?.items ?? [];

  const handleLikeClick = (contentId: number) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    setLikedContentIds((previous) =>
      previous.includes(contentId)
        ? previous.filter((id) => id !== contentId)
        : [...previous, contentId]
    );
  };

  return (
    <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
      <div
        style={{
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        <SectionHeader
          title={`${regionName}에서 진행 중인 행사`}
          actionText="전체보기"
          onActionClick={() =>
            navigate(
              `/festival/search?${new URLSearchParams({ region: regionName }).toString()}`
            )
          }
        />
      </div>

      <div
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max" style={{ gap: CARD_GAP * scale }}>
            {isPending ? (
              <>
                <ContentCardSkeleton />
                <ContentCardSkeleton />
              </>
            ) : (
              festivals.map((festival) => (
                <ContentCard
                  key={festival.contentId}
                  image={festival.thumbnailImageUrl}
                  title={festival.title}
                  firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                  secondInfo={festival.regionName}
                  tags={toContentTagIds(festival.hashtags)}
                  liked={
                    isLoggedIn && likedContentIds.includes(festival.contentId)
                  }
                  onClick={() =>
                    navigate(buildFestivalDetailPath(festival.contentId))
                  }
                  onLikeClick={() => handleLikeClick(festival.contentId)}
                />
              ))
            )}
          </div>
        </div>

        {!isPending && isError ? (
          <div
            className="flex flex-col items-center"
            style={{
              marginTop: ERROR_MARGIN_TOP * scale,
              gap: ERROR_MARGIN_TOP * scale,
            }}
          >
            <p
              className="text-main-5 text-center font-medium"
              style={{ fontSize: ERROR_TEXT_SIZE * scale }}
            >
              행사를 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {!isPending && !isError && festivals.length === 0 ? (
          <p
            className="text-gray-4 text-center font-medium"
            style={{
              marginTop: ERROR_MARGIN_TOP * scale,
              fontSize: ERROR_TEXT_SIZE * scale,
            }}
          >
            진행 중인 행사가 없습니다.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default RegionFestivalSection;
