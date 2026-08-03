import assert from 'node:assert/strict';
import test from 'node:test';

import {
  completeTagSelection,
  EVENT_SELECTION_PATH,
} from '../src/pages/local-recommendation/tag-selection/navigation.ts';
import { mapTagIdsToHashtagIds } from '../src/pages/local-recommendation/tag-selection/hashtagMapping.ts';
import type { TagId } from '../src/pages/local-recommendation/tag-selection/types.ts';

// tag.type.ts의 TagId에 대응하는 한글 라벨 fixture.
// 실제 라벨은 src/constants/tags.ts(tagDefinitionMap)가 소스지만, 그 파일은 svg 에셋을
// 함께 임포트하므로 이 순수 로직 테스트에서는 fixture 맵으로 대체한다.
const tagLabelFixture: Partial<Record<TagId, string>> = {
  spring: '봄',
  sea: '바다',
  mountain: '산',
};
const getLabel = (tagId: TagId) => tagLabelFixture[tagId];

test('태그 선택 완료 결과를 전달하고 행사 선택 페이지로 이동한다', () => {
  const photo = new File(['image'], 'course.png', { type: 'image/png' });
  const completedResults: unknown[] = [];
  const navigatedPaths: string[] = [];

  const completed = completeTagSelection({
    photo: { file: photo, previewUrl: 'blob:course' },
    selectedTagIds: new Set<TagId>(['local-attraction']),
    photoKey: 'courses/thumbnail/abcd1234.jpg',
    hashtagIds: [7],
    onComplete: (result) => completedResults.push(result),
    navigate: (path) => navigatedPaths.push(path),
  });

  assert.equal(completed, true);
  assert.deepEqual(completedResults, [
    {
      photo,
      tagIds: ['local-attraction'],
      photoKey: 'courses/thumbnail/abcd1234.jpg',
      hashtagIds: [7],
    },
  ]);
  assert.deepEqual(navigatedPaths, [EVENT_SELECTION_PATH]);
});

test('선택된 TagId를 라벨이 일치하는 서버 해시태그 id로 매핑한다', () => {
  const hashtagIds = mapTagIdsToHashtagIds(
    ['spring', 'sea'],
    [
      { id: 1, name: '봄' },
      { id: 3, name: '바다' },
      { id: 9, name: '카페' },
    ],
    getLabel
  );

  assert.deepEqual(hashtagIds, [1, 3]);
});

test('서버 해시태그 목록에 없는 라벨은 매핑 결과에서 건너뛴다', () => {
  const hashtagIds = mapTagIdsToHashtagIds(
    ['spring', 'mountain'],
    [{ id: 1, name: '봄' }],
    getLabel
  );

  assert.deepEqual(hashtagIds, [1]);
});

test('해시태그 목록이 비어 있으면 빈 배열을 반환한다', () => {
  const hashtagIds = mapTagIdsToHashtagIds(['spring', 'sea'], [], getLabel);

  assert.deepEqual(hashtagIds, []);
});
