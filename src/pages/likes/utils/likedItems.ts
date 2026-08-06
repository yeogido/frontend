import {
  ALL_FILTER_OPTION,
  LIKED_EVENT_DETAIL_OPTIONS,
  LIKED_PLACE_DETAIL_OPTIONS,
  LIKED_SORT_LATEST,
  likedCategoryByLabel,
} from '../constants/filters';
import { durationLabelByType } from '../../../utils/courseCard';
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
    region: item.category === 'COURSE' ? item.location : null,
    detailType: null,
    hashtags: item.hashtags,
    likedAt: item.likedAt,
  };
}

const normalizeSearchText = (text: string) => text.replace(/\s/g, '');

/**
 * 2번째 필터 옵션. '코스'는 좋아요한 코스의 지역을 동적으로 채우고,
 * '행사'/'장소'는 고정 분류를 쓴다. '전체'는 두 경우 모두 맨 앞에 붙는다.
 */
export function getDetailFilterOptions(
  categoryLabel: string,
  items: readonly LikedItem[]
): readonly string[] {
  const category = likedCategoryByLabel[categoryLabel];

  if (category === 'EVENT') {
    return LIKED_EVENT_DETAIL_OPTIONS;
  }

  if (category === 'PLACE') {
    return LIKED_PLACE_DETAIL_OPTIONS;
  }

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
    .join(' ~ ');

  return {
    firstInfo: period,
    secondInfo: item.location,
  };
}
