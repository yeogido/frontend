import type { TagId } from '../types/tag.type';

const tagIdByHashtag: Record<string, TagId> = {
  봄: 'spring',
  여름: 'summer',
  가을: 'autumn',
  겨울: 'winter',
  자연: 'nature',
  산: 'mountain',
  바다: 'sea',
  맛집: 'restaurant',
  카페: 'cafe',
  베이커리: 'bakery',
  체험: 'experience',
  행사: 'event',
  지역명소: 'local-attraction',
};

export function toContentTagId(hashtag: string): TagId | undefined {
  return Object.prototype.hasOwnProperty.call(tagIdByHashtag, hashtag)
    ? tagIdByHashtag[hashtag]
    : undefined;
}

export function toContentTagIds(hashtags: readonly string[]): TagId[] {
  return hashtags.flatMap((hashtag) => {
    const tagId = toContentTagId(hashtag);

    return tagId ? [tagId] : [];
  });
}
