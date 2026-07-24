import assert from 'node:assert/strict';
import test from 'node:test';

import {
  completeTagSelection,
  EVENT_SELECTION_PATH,
} from '../src/pages/local-recommendation/tag-selection/navigation.ts';
import type { TagId } from '../src/pages/local-recommendation/tag-selection/types.ts';

test('태그 선택 완료 결과를 전달하고 행사 선택 페이지로 이동한다', () => {
  const photo = new File(['image'], 'course.png', { type: 'image/png' });
  const completedResults: unknown[] = [];
  const navigatedPaths: string[] = [];

  const completed = completeTagSelection({
    photo: { file: photo, previewUrl: 'blob:course' },
    selectedTagIds: new Set<TagId>(['local-attraction']),
    onComplete: (result) => completedResults.push(result),
    navigate: (path) => navigatedPaths.push(path),
  });

  assert.equal(completed, true);
  assert.deepEqual(completedResults, [
    { photo, tagIds: ['local-attraction'] },
  ]);
  assert.deepEqual(navigatedPaths, [EVENT_SELECTION_PATH]);
});
