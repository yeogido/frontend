import type { TagId } from './tag.type';

export interface LocalCourse {
  id: number;
  image: string;
  title: string;
  duration: string;
  courseType: string;
  companion: string;
  tags: TagId[];
  liked: boolean;
}
