import type { CultureContent } from '../../../types/content.type';

import type { FestivalApiItem, FestivalItem } from './types';

// Real API results don't carry a dedicated "tag" field — fall back to the
// first hashtag, then the title, so downstream consumers that key off `tag`
// (e.g. the local-recommendation draft store) keep working.
export const toFestivalApiItem = (
  content: CultureContent
): FestivalApiItem => ({
  id: String(content.contentId),
  contentId: content.contentId,
  tag: content.hashtags[0] ?? content.title,
  title: content.title,
  address: content.regionName,
});

export const toFestivalItem = (content: CultureContent): FestivalItem => ({
  ...toFestivalApiItem(content),
  imageSrc: content.thumbnailImageUrl ?? null,
});
