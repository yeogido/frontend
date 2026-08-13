import { toFestivalItem } from './festivalTransform.ts';
import type { FestivalItem } from './types';
import type {
  GetCultureContentsParams,
  GetCultureContentsResponse,
} from '../../../types/content.type';

export type GetCultureContents = (
  params: GetCultureContentsParams,
  signal?: AbortSignal
) => Promise<GetCultureContentsResponse>;

export const searchFestivals = async (
  keyword: string,
  getCultureContents: GetCultureContents,
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
