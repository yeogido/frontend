import { useState } from 'react';

import DesktopFilterChip from '../../../components/layout/desktop/DesktopFilterChip';
import DesktopFilterDropdown from '../../../components/layout/desktop/DesktopFilterDropdown';
import { useDistanceSortCoordinates } from '../../../hooks/useDistanceSortCoordinates';
import type { ContentCategory, ContentSort } from '../../../types/content.type';
import {
  festivalCategoryOptions,
  festivalSortOptions,
  type FestivalCategoryValue,
  type FestivalSortValue,
} from '../../festival/constants/filters';
import HomeFestivalSection from '../../home/desktop/HomeFestivalSection';

const categoryByValue: Record<
  FestivalCategoryValue,
  ContentCategory | undefined
> = {
  ALL: undefined,
  EXPERIENCE: 'EXPERIENCE',
  EXHIBITION: 'EXHIBITION',
  PERFORMANCE: 'PERFORMANCE',
  FESTIVAL: 'FESTIVAL',
};
const sortByValue: Record<FestivalSortValue, ContentSort> = {
  RECOMMENDED: 'RECOMMEND',
  SAVED: 'LIKE',
  DISTANCE: 'DISTANCE',
  ENDING_SOON: 'DEADLINE',
};
const sortLabels = festivalSortOptions.map((option) => option.label);

interface RegionFestivalSectionProps {
  readonly title: string;
  readonly regionId?: number;
  readonly keyword?: string;
  readonly enabled: boolean;
  readonly moreTo: string;
}

/** 지역 결과의 행사 섹션 — 행사 화면과 같은 정렬·분류 필터(Figma 6364:55020). */
function RegionFestivalSection(props: RegionFestivalSectionProps) {
  const [sort, setSort] = useState<FestivalSortValue>('RECOMMENDED');
  const [category, setCategory] = useState<FestivalCategoryValue>('ALL');
  const { coordinates, status, requestCoordinates } =
    useDistanceSortCoordinates();
  const isDistanceSort = sort === 'DISTANCE';
  const sortLabel =
    festivalSortOptions.find((option) => option.value === sort)?.label ??
    sortLabels[0];

  const handleSortChange = (label: string) => {
    const next = festivalSortOptions.find((option) => option.label === label);

    if (!next) return;
    setSort(next.value);
    if (next.value === 'DISTANCE') void requestCoordinates();
  };

  return (
    <HomeFestivalSection
      {...props}
      enabled={
        props.enabled &&
        (!isDistanceSort || status === 'ready' || status === 'failed')
      }
      category={categoryByValue[category]}
      sort={sortByValue[sort]}
      latitude={isDistanceSort ? coordinates?.latitude : undefined}
      longitude={isDistanceSort ? coordinates?.longitude : undefined}
      toolbar={
        <div className="flex items-center gap-[16px]">
          <DesktopFilterDropdown
            label="행사 정렬"
            options={sortLabels}
            value={sortLabel}
            onChange={handleSortChange}
          />
          {festivalCategoryOptions.map((option) => (
            <DesktopFilterChip
              key={option.value}
              label={option.label}
              selected={category === option.value}
              onClick={() => setCategory(option.value)}
            />
          ))}
        </div>
      }
    />
  );
}

export default RegionFestivalSection;
