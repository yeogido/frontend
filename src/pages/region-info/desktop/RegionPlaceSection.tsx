import { useState } from 'react';
import { MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import TagChip from '../../../components/common/TagChip';
import DesktopFilterChip from '../../../components/layout/desktop/DesktopFilterChip';
import DesktopFilterDropdown from '../../../components/layout/desktop/DesktopFilterDropdown';
import { useBusinessPromotions } from '../../../hooks/useBusinessPromotions';
import { buildLocalBusinessDetailPath } from '../../../utils/routes';
import HomeSectionHeader from '../../home/desktop/HomeSectionHeader';
import {
  businessCategories,
  businessSortOptions,
} from '../../local-business/constants';
import {
  mapBusinessCategoryToApiParam,
  mapBusinessPromotionItemToBusinessItem,
  mapBusinessSortToApiParam,
} from '../../local-business/mappers/businessPromotionMapper';
import type {
  BusinessCategory,
  BusinessSort,
} from '../../local-business/types';

// Figma 1440 데스크톱 시안(6364:55034 이 곳은 어때요?) 기준 리터럴 px.
const PLACE_COUNT = 8;
const SKELETON_COUNT = 4;
const CARD_HEIGHT = 286;
const IMAGE_HEIGHT = 172;
const MAX_TAGS = 2;

interface RegionPlaceSectionProps {
  readonly title: string;
  readonly regionId?: number;
  readonly enabled: boolean;
  readonly moreTo: string;
}

/** 지역 결과의 장소 섹션 — 지역 소상공인 홍보글을 정렬·분류 필터로 보여 준다. */
function RegionPlaceSection({
  title,
  regionId,
  enabled,
  moreTo,
}: RegionPlaceSectionProps) {
  const navigate = useNavigate();
  const [category, setCategory] = useState<BusinessCategory>('전체');
  const [sort, setSort] = useState<BusinessSort>('추천순');
  const { data, isPending, isError } = useBusinessPromotions(
    {
      category:
        category === '전체'
          ? undefined
          : mapBusinessCategoryToApiParam(category),
      sort: mapBusinessSortToApiParam(sort),
      size: PLACE_COUNT,
      regionId,
    },
    { enabled }
  );
  const businesses = (data?.pages[0]?.items ?? [])
    .slice(0, PLACE_COUNT)
    .map(mapBusinessPromotionItemToBusinessItem);

  return (
    <section aria-label={title} className="flex flex-col gap-[20px]">
      <HomeSectionHeader title={title} onMoreClick={() => navigate(moreTo)} />

      <div className="flex items-center gap-[16px]">
        <DesktopFilterDropdown
          label="장소 정렬"
          options={businessSortOptions}
          value={sort}
          onChange={setSort}
        />
        {businessCategories.map((option) => (
          <DesktopFilterChip
            key={option}
            label={option}
            selected={category === option}
            onClick={() => setCategory(option)}
          />
        ))}
      </div>

      {isError ? (
        <p role="alert" className="text-main-5 text-[16px] font-medium">
          장소를 불러오지 못했어요.
        </p>
      ) : null}
      {enabled && !isPending && !isError && businesses.length === 0 ? (
        <p className="text-gray-4 py-[32px] text-center">
          조건에 맞는 장소가 없어요.
        </p>
      ) : null}

      <div className="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
        {isPending
          ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                style={{ height: CARD_HEIGHT }}
                className="bg-gray-2 animate-pulse rounded-[12px]"
              />
            ))
          : businesses.map((business) => (
              <button
                key={business.id}
                type="button"
                onClick={() =>
                  navigate(buildLocalBusinessDetailPath(business.id))
                }
                className="flex flex-col gap-[16px] text-left"
              >
                <span
                  style={{ height: IMAGE_HEIGHT }}
                  className="bg-gray-2 block w-full overflow-hidden rounded-[12px]"
                >
                  {business.image ? (
                    <img
                      src={business.image}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>
                <span className="flex flex-col gap-[8px]">
                  <span className="truncate text-[20px] leading-[1.5] font-medium text-black">
                    {business.title}
                  </span>
                  <span className="text-gray-4 flex items-center gap-[2px] text-[16px] font-medium">
                    <MdLocationOn aria-hidden="true" className="text-[18px]" />
                    {business.location}
                  </span>
                </span>
                {business.tags.length > 0 ? (
                  <span className="flex items-center gap-[8px]">
                    {business.tags.slice(0, MAX_TAGS).map((tag) => (
                      <TagChip
                        key={tag}
                        type={tag}
                        className="w-auto"
                        style={{ height: 25 }}
                      />
                    ))}
                  </span>
                ) : null}
              </button>
            ))}
      </div>
    </section>
  );
}

export default RegionPlaceSection;
