import type { TagId } from './tag.type';

export interface DetailTag {
  readonly id: string | number;
  readonly tagId?: TagId;
  readonly label?: string;
}
