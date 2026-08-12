import type { TagType } from '../../components/common/TagChip';

import { businessCategories, businessSortOptions } from './constants';

export type BusinessCategory = (typeof businessCategories)[number];
export type BusinessSort = (typeof businessSortOptions)[number];
export type BusinessViewMode = 'grid' | 'card';

export interface BusinessItem {
  id: string;
  // 좋아요는 홍보글(promotionId)이 아니라 장소(placeId) 단위 API라 따로 든다.
  placeId: number;
  title: string;
  description: string;
  location: string;
  category: Exclude<BusinessCategory, '전체'>;
  author: string;
  authorAvatarUrl: string;
  date: string;
  image: string;
  tags: TagType[];
  liked: boolean;
  isMine: boolean;
}
