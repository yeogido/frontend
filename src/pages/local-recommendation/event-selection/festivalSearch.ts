import { getCultureContents } from '../../../apis/contents.api';

import { toFestivalItem } from './festivalTransform';
import type { FestivalItem } from './types';

export const searchFestivals = async (
  keyword: string
): Promise<FestivalItem[]> => {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return [];
  }

  const { items } = await getCultureContents({
    category: 'FESTIVAL',
    keyword: trimmedKeyword,
  });

  return items.map(toFestivalItem);
};
