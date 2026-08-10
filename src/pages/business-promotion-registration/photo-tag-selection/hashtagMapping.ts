import type { Hashtag } from '../../../apis/hashtags';
import type { TagId } from './types';

export interface MapTagIdsToHashtagIdsResult {
  hashtagIds: number[];
  /** 서버 해시태그 목록에서 라벨을 못 찾아 매핑에 실패한 TagId들. */
  unmappedTagIds: TagId[];
}

/**
 * local-recommendation/tag-selection/hashtagMapping.ts를 참고해 분리했다.
 * 로컬 TagId를 서버 해시태그 숫자 id로 매핑한다.
 * getLabel로 얻은 태그의 한글 label과 이름이 같은 Hashtag의 id를 사용한다.
 *
 * 매핑에 실패한 TagId는 조용히 빼지 않고 unmappedTagIds로 돌려준다 —
 * 호출부(PhotoTagSelectionScreen)가 이걸 보고 하나라도 있으면 등록을
 * 막아야, 사용자가 고른 키워드가 말없이 누락되는 걸 막을 수 있다.
 */
export const mapTagIdsToHashtagIds = (
  tagIds: readonly TagId[],
  hashtags: readonly Hashtag[],
  getLabel: (tagId: TagId) => string | undefined
): MapTagIdsToHashtagIdsResult => {
  const hashtagIdByName = new Map(
    hashtags.map((hashtag) => [hashtag.name, hashtag.id])
  );

  const hashtagIds: number[] = [];
  const unmappedTagIds: TagId[] = [];

  tagIds.forEach((tagId) => {
    const label = getLabel(tagId);
    const hashtagId = label ? hashtagIdByName.get(label) : undefined;

    if (hashtagId !== undefined) {
      hashtagIds.push(hashtagId);
    } else {
      unmappedTagIds.push(tagId);
    }
  });

  return { hashtagIds, unmappedTagIds };
};
