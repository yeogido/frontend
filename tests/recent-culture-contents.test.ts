import assert from 'node:assert/strict';
import test from 'node:test';

import type { RecentCultureContent } from '../src/types/content.type.ts';
import { upsertRecentCultureContent } from '../src/utils/recentCultureContents.ts';

const createContent = (contentId: number): RecentCultureContent => ({
  contentId,
  title: `행사 ${contentId}`,
  thumbnailImageUrl: '',
  regionName: '서울',
  hashtags: [],
  startDate: '2026-07-30',
  endDate: '2026-07-30',
  liked: false,
});

test('keeps recent culture contents unique and moves revisited content to the front', () => {
  assert.deepEqual(
    upsertRecentCultureContent(
      [createContent(2), createContent(1)],
      createContent(1),
    ).map((content) => content.contentId),
    [1, 2],
  );
});

test('keeps at most ten recent culture contents', () => {
  const contents = Array.from({ length: 10 }, (_, index) =>
    createContent(index + 1),
  );

  const result = upsertRecentCultureContent(contents, createContent(11));

  assert.equal(result.length, 10);
  assert.deepEqual(
    result.map((content) => content.contentId),
    [11, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
});
