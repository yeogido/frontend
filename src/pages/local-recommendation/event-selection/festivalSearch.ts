import { getCultureContents } from '../../../apis/contents.api';

import { toFestivalItem } from './festivalTransform';
import type { FestivalItem } from './types';

export const searchFestivals = async (
  keyword: string,
  signal?: AbortSignal
): Promise<FestivalItem[]> => {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return [];
  }

  const { items } = await getCultureContents({
    category: 'FESTIVAL',
    keyword: trimmedKeyword,
  }, signal);

  return items.map(toFestivalItem);
};
