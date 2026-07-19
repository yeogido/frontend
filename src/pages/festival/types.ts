import type { TagId } from '../../types/tag.type';
import type { FestivalCategoryValue } from './constants/filters';

export type FestivalStatus = 'ONGOING';

export interface FestivalPreview {
  id: number;
  image: string;
  title: string;
  period: string;
  location: string;
  category: FestivalCategoryValue;
  status: FestivalStatus;
  tags: TagId[];
  liked: boolean;
}

export interface FeaturedFestival {
  id: number;
  image: string;
  title: string;
  description: string;
  period: string;
}
