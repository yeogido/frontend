import { businessCategories, businessSortOptions } from './constants';

export type BusinessCategory = (typeof businessCategories)[number];
export type BusinessSort = (typeof businessSortOptions)[number];
export type BusinessViewMode = 'grid' | 'card';

export interface BusinessItem {
  id: string;
  title: string;
  description: string;
  location: string;
  category: Exclude<BusinessCategory, '전체'>;
  author: string;
  date: string;
  image: string;
}
