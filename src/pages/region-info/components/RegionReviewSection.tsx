import { useNavigate } from 'react-router-dom';

import {
  PromotionCard,
  PromotionCardSkeleton,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useBusinessPromotions } from '../../../hooks/useBusinessPromotions';
import {
  formatBusinessPromotionDate,
  toRegionDisplayName,
} from '../../local-business/mappers/businessPromotionMapper';
import { buildLocalBusinessDetailPath } from '../../../utils/routes';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;
const RETRY_BUTTON_FONT_SIZE = 14;
const RETRY_BUTTON_PADDING_X = 16;
const RETRY_BUTTON_PADDING_Y = 8;

interface RegionReviewSectionProps {
  regionName: string;
  regionSlug: string;
  regionId?: number;
  isRegionLoading?: boolean;
}

function RegionReviewSection({
  regionName,
  regionSlug,
  regionId,
  isRegionLoading = false,
}: RegionReviewSectionProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();

  const hasRegionId = regionId !== undefined;

  const {
    data,
    isPending: isPromotionPending,
    isError: isPromotionError,
    refetch,
  } = useBusinessPromotions(
    { regionId, sort: 'RECOMMEND', size: 1 },
    { enabled: !isRegionLoading && hasRegionId }
  );

  // regionId를 끝내 찾지 못하면(예: /regions에 없는 지역) 쿼리를
  // undefined regionId로 실행해 전국 데이터를 잘못 보여주는 대신
  // 바로 에러 상태로 취급한다.
  const isPending = isRegionLoading || (hasRegionId && isPromotionPending);
  const isError = !isRegionLoading && (!hasRegionId || isPromotionError);

  const promotion = data?.pages[0]?.items[0];

  return (
    <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
      <div
        style={{
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        <SectionHeader
          title={`${regionName}에서 이 곳은 어때요?`}
          actionText="전체보기"
          onActionClick={() =>
            navigate(`/local-business?${new URLSearchParams({ region: regionSlug }).toString()}`)
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
        {isPending ? (
          <PromotionCardSkeleton />
        ) : (
          promotion && (
            <PromotionCard
              avatarUrl={promotion.thumbnailImageUrl}
              profileName={promotion.author.nickname}
              date={formatBusinessPromotionDate(promotion.createdAt)}
              imageUrl={promotion.thumbnailImageUrl}
              title={promotion.placeName}
              description={promotion.shortDescription}
              location={toRegionDisplayName(
                promotion.regionName,
                promotion.roadAddress
              )}
              onClick={() =>
                navigate(buildLocalBusinessDetailPath(promotion.promotionId))
              }
            />
          )
        )}
      </div>

      {!isPending && isError ? (
        <div
          className="flex flex-col items-center"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            gap: ERROR_MARGIN_TOP * scale,
            paddingLeft: SECTION_PADDING_X * scale,
            paddingRight: SECTION_PADDING_X * scale,
          }}
        >
          <p
            className="text-main-5 text-center font-medium"
            style={{ fontSize: ERROR_TEXT_SIZE * scale }}
          >
            정보를 불러오지 못했어요.
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

      {!isPending && !isError && !promotion ? (
        <p
          className="text-gray-4 text-center font-medium"
          style={{
            marginTop: ERROR_MARGIN_TOP * scale,
            fontSize: ERROR_TEXT_SIZE * scale,
          }}
        >
          등록된 정보가 없습니다.
        </p>
      ) : null}
    </section>
  );
}

export default RegionReviewSection;
