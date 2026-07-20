import type { TagId } from '../../types/tag.type';

export interface YeogidoCourse {
  id: number;
  title: string;
  duration: string;
  courseName: string;
  tags?: TagId[];
}
