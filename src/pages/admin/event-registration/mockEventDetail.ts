import type { DetailTag } from '../../../types/detail';
import type { TagId } from '../../../types/tag.type';
import type {
  FestivalDetail,
} from '../../detail/types/festivalDetail';
import { tagDefinitionMap } from '../../../constants/tags';
import type { PlaceItem } from '../../local-recommendation/place-selection/types';
import type { AdminEventBasicInfo, EventCategoryId } from './types';
import { eventCategoryOptions } from './types';

const formatDate = (value: string) => value.replaceAll('-', '.');

export const formatEventPeriod = (startDate: string, endDate: string) =>
  `${formatDate(startDate)} - ${formatDate(endDate)}`;

const categoryLabel = (category: EventCategoryId | null) =>
  eventCategoryOptions.find((option) => option.id === category)?.label ?? '';

interface BuildMockEventDetailParams {
  place: PlaceItem;
  basicInfo: AdminEventBasicInfo;
  heroImageUrl: string;
  keywordTagIds: readonly TagId[];
  category: EventCategoryId | null;
}

export function buildMockEventDetail({
  place,
  basicInfo,
  heroImageUrl,
  keywordTagIds,
  category,
}: BuildMockEventDetailParams): FestivalDetail {
  const keywordTags: DetailTag[] = keywordTagIds.map((tagId) => ({
    id: tagId,
    tagId,
    label: tagDefinitionMap[tagId]?.label,
  }));
  const categoryTag: DetailTag[] = category
    ? [{ id: `category-${category}`, label: categoryLabel(category) }]
    : [];

  return {
    id: 'admin-preview',
    title: basicInfo.placeName,
    heroImageUrl,
    liked: false,
    tags: [...categoryTag, ...keywordTags],
    overview: basicInfo.placeIntro || '등록된 소개가 없습니다.',
    address: place.address,
    period: formatEventPeriod(basicInfo.startDate, basicInfo.endDate),
    phone: basicInfo.phone || '-',
    homepageUrl: basicInfo.homepage,
    homepageLabel: basicInfo.homepage || '공식홈페이지',
    place: {
      id: 0,
      name: place.title,
      address: place.address,
      hours: formatEventPeriod(basicInfo.startDate, basicInfo.endDate),
      image: heroImageUrl,
      liked: false,
      location: { latitude: place.latitude, longitude: place.longitude },
    },
    relatedCourses: [],
  };
}
