import type { TagId } from '../../types/tag.type';
import type { FestivalCategoryValue } from './constants/filters';

export interface FestivalPreview {
  id: number;
  image: string;
  title: string;
  period: string;
  location: string;
  category: FestivalCategoryValue;
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
