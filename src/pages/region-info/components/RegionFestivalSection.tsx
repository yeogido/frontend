import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  EditableContentCard,
  FestivalDeleteDialog,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useContentDelete } from '../../../hooks/useContentDelete';
import { useCultureContents } from '../../../hooks/useCultureContents';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useEditFestival } from '../../../hooks/useEditFestival';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import { toContentTagIds } from '../../../utils/contentTags';
import { buildFestivalDetailPath } from '../../../utils/routes';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;
const REGION_FESTIVAL_PREVIEW_COUNT = 2;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;
const RETRY_BUTTON_FONT_SIZE = 14;
const RETRY_BUTTON_PADDING_X = 16;
const RETRY_BUTTON_PADDING_Y = 8;

interface RegionFestivalSectionProps {
  regionName: string;
  regionId?: number;
  isRegionLoading?: boolean;
}

function RegionFestivalSection({
  regionName,
  regionId,
  isRegionLoading = false,
}: RegionFestivalSectionProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useContentLikeToggle();
  const isAdmin = useIsAdmin();
  const { editFestival } = useEditFestival();
  const { requestDelete, dialogProps } = useContentDelete();

  // regionId를 찾지 못한 지역(예: /regions 목록에 없는 지역)은
  // regionId 필터 대신 지역명을 키워드로 검색해 대체한다.
  // 지역 목록이 아직 로딩 중일 때는 대기시켜, regionId 미확정 상태에서
  // 키워드 검색이 먼저 떴다가 지역 필터로 바뀌는 깜빡임을 막는다.
  const { data, isPending, isError, refetch } = useCultureContents(
    {
      regionId,
      keyword: regionId === undefined ? regionName : undefined,
      statuses: ['ONGOING'],
      sort: 'RECOMMEND',
      size: REGION_FESTIVAL_PREVIEW_COUNT,
    },
    { enabled: !isRegionLoading }
  );

  const festivals = data?.pages[0]?.items ?? [];

  return (
    <>
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
                `/festival/ongoing?${new URLSearchParams({ region: regionName }).toString()}`
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
                festivals.map((festival) =>
                  isAdmin ? (
                    <EditableContentCard
                      key={festival.contentId}
                      image={festival.thumbnailImageUrl}
                      title={festival.title}
                      firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                      secondInfo={festival.regionName}
                      tags={toContentTagIds(festival.hashtags)}
                      onClick={() =>
                        navigate(buildFestivalDetailPath(festival.contentId))
                      }
                      onEdit={() => void editFestival(festival.contentId)}
                      onDelete={() => requestDelete(festival.contentId)}
                    />
                  ) : (
                    <ContentCard
                      key={festival.contentId}
                      image={festival.thumbnailImageUrl}
                      title={festival.title}
                      firstInfo={`${festival.startDate} ~ ${festival.endDate}`}
                      secondInfo={festival.regionName}
                      tags={toContentTagIds(festival.hashtags)}
                      liked={getLiked(festival.contentId, false)}
                      onClick={() =>
                        navigate(buildFestivalDetailPath(festival.contentId))
                      }
                      onLikeClick={() =>
                        toggleLike(
                          festival.contentId,
                          getLiked(festival.contentId, false)
                        )
                      }
                    />
                  )
                )
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
                className="rounded-full border border-[#e4e4e4] font-medium text-[#505050]"
                style={{
                  fontSize: RETRY_BUTTON_FONT_SIZE * scale,
                  paddingLeft: RETRY_BUTTON_PADDING_X * scale,
                  paddingRight: RETRY_BUTTON_PADDING_X * scale,
                  paddingTop: RETRY_BUTTON_PADDING_Y * scale,
                  paddingBottom: RETRY_BUTTON_PADDING_Y * scale,
                }}
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
      <FestivalDeleteDialog {...dialogProps} />
    </>
  );
}

export default RegionFestivalSection;
