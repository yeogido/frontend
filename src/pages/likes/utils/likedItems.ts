import {
  ALL_FILTER_OPTION,
  LIKED_SORT_LATEST,
  likedCategoryByLabel,
} from '../constants/filters.ts';
import { durationLabelByType } from '../../../utils/courseCard.ts';
import type { CourseDurationType } from '../../../types/course.type';
import type { LikedItem } from '../types';
import type { LikedItemResponse } from '../../../apis/likes.api';

function toCourseDurationLabel(duration: string | null): string | null {
  if (!duration) {
    return duration;
  }

  return durationLabelByType[duration as CourseDurationType] ?? duration;
}

export function mapLikedItemResponse(item: LikedItemResponse): LikedItem {
  return {
    id: item.id,
    category: item.category,
    title: item.title,
    thumbnailUrl: item.thumbnailImage,
    duration:
      item.category === 'COURSE'
        ? toCourseDurationLabel(item.duration)
        : item.duration,
    startDate: item.startDate,
    endDate: item.endDate,
    location: item.location,
    companion: null,
    distance: item.category === 'PLACE' ? item.distance : null,
    region: item.category === 'COURSE' ? item.location : null,
    detailType: null,
    hashtags: item.hashtags,
    likedAt: item.likedAt,
  };
}

const normalizeSearchText = (text: string) => text.replace(/\s/g, '');

/**
 * 2번째 필터 옵션. '코스'는 좋아요한 코스의 지역을 동적으로 채운다.
 * '행사'/'장소'는 좋아요 목록 응답에 분류 값(detailType)이 없어 고를 수 있는 게
 * '전체'뿐이다. 서버가 분류를 내려주면 그때 옵션을 되살린다.
 */
export function getDetailFilterOptions(
  categoryLabel: string,
  items: readonly LikedItem[]
): readonly string[] {
  const category = likedCategoryByLabel[categoryLabel];

  if (category === 'COURSE') {
    const likedRegions = items.flatMap((item) =>
      item.category === 'COURSE' && item.region ? [item.region] : []
    );

    return [ALL_FILTER_OPTION, ...new Set(likedRegions)];
  }

  return [ALL_FILTER_OPTION];
}

interface FilterLikedItemsParams {
  items: readonly LikedItem[];
  categoryLabel: string;
  detailLabel: string;
  keyword: string;
}

export function filterLikedItems({
  items,
  categoryLabel,
  detailLabel,
  keyword,
}: FilterLikedItemsParams): LikedItem[] {
  const category = likedCategoryByLabel[categoryLabel];
  const normalizedKeyword = normalizeSearchText(keyword.trim());

  return items.filter((item) => {
    if (category && item.category !== category) {
      return false;
    }

    if (detailLabel !== ALL_FILTER_OPTION) {
      const detailValue = category === 'COURSE' ? item.region : item.detailType;

      if (detailValue !== detailLabel) {
        return false;
      }
    }

    if (
      normalizedKeyword &&
      !normalizeSearchText(item.title).includes(normalizedKeyword)
    ) {
      return false;
    }

    return true;
  });
}

export function sortLikedItems(
  items: readonly LikedItem[],
  sortLabel: string
): LikedItem[] {
  const direction = sortLabel === LIKED_SORT_LATEST ? -1 : 1;

  return [...items].sort(
    (a, b) => a.likedAt.localeCompare(b.likedAt) * direction
  );
}

interface LikedItemInfoLines {
  firstInfo: string;
  secondInfo: string;
  thirdInfo?: string;
  distanceInfo?: string;
}

/** 장소 카드 세 번째 줄. 소수점 한 자리까지만 남긴다. */
export function toDistanceLabel(distance: number | null): string | undefined {
  if (distance === null || !Number.isFinite(distance)) {
    return undefined;
  }

  return `현위치와 ${Math.round(distance * 10) / 10}KM`;
}

function toYearMonthLabel(date: string): string {
  const match = date.match(/^(\d{4})[-./](\d{2})/);

  return match ? `${match[1]}.${match[2]}` : date;
}

/** 카드 본문 두 줄(기간 / 위치·동행)을 카테고리에 맞게 만든다. */
export function toLikedItemInfoLines(item: LikedItem): LikedItemInfoLines {
  if (item.category === 'COURSE') {
    return {
      firstInfo: item.duration ?? '',
      secondInfo: item.location,
      thirdInfo: item.companion ?? undefined,
    };
  }

  const period = [item.startDate, item.endDate]
    .filter((date): date is string => Boolean(date))
    .map(toYearMonthLabel)
    .join(' ~ ');

  return {
    firstInfo: period,
    secondInfo: item.location,
    distanceInfo: toDistanceLabel(item.distance),
  };
}
