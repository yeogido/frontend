import type { Hashtag } from '../../../apis/hashtags';
import type { TagId } from './types';

/**
 * local-recommendation/tag-selection/hashtagMapping.ts를 그대로 복사했다.
 * 로컬 TagId를 서버 해시태그 숫자 id로 매핑한다.
 * getLabel로 얻은 태그의 한글 label과 이름이 같은 Hashtag의 id를 사용한다.
 * 서버 해시태그 목록에 해당 label이 없으면 그 태그는 결과에서 건너뛴다 (허용된 단순화).
 */
export const mapTagIdsToHashtagIds = (
  tagIds: readonly TagId[],
  hashtags: readonly Hashtag[],
  getLabel: (tagId: TagId) => string | undefined
): number[] => {
  const hashtagIdByName = new Map(
    hashtags.map((hashtag) => [hashtag.name, hashtag.id])
  );

  return tagIds.reduce<number[]>((hashtagIds, tagId) => {
    const label = getLabel(tagId);
    const hashtagId = label ? hashtagIdByName.get(label) : undefined;

    if (hashtagId !== undefined) {
      hashtagIds.push(hashtagId);
    }

    return hashtagIds;
  }, []);
};
