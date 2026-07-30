import assert from 'node:assert/strict';
import test from 'node:test';

import {
  toFestivalApiItem,
  toFestivalItem,
} from '../src/pages/local-recommendation/event-selection/festivalTransform.ts';
import type { CultureContent } from '../src/types/content.type.ts';

const buildContent = (
  overrides: Partial<CultureContent> = {}
): CultureContent => ({
  contentId: 3,
  placeId: 1,
  title: '광안리 해변 페스티벌',
  thumbnailImageUrl: 'https://example.com/thumb.webp',
  regionName: '수영구',
  hashtags: ['바다', '체험', '행사'],
  likeCount: 0,
  startDate: '2026-07-20',
  endDate: '2026-07-27',
  ...overrides,
});

test('toFestivalApiItem maps a content list item to a festival api item', () => {
  const content = buildContent();

  assert.deepEqual(toFestivalApiItem(content), {
    id: '3',
    contentId: 3,
    tag: '바다',
    title: '광안리 해변 페스티벌',
    address: '수영구',
  });
});

test('toFestivalApiItem falls back to the title when there are no hashtags', () => {
  const content = buildContent({ hashtags: [] });

  assert.equal(toFestivalApiItem(content).tag, '광안리 해변 페스티벌');
});

test('toFestivalItem adds the thumbnail as imageSrc', () => {
  const content = buildContent();

  assert.deepEqual(toFestivalItem(content), {
    id: '3',
    contentId: 3,
    tag: '바다',
    title: '광안리 해변 페스티벌',
    address: '수영구',
    imageSrc: 'https://example.com/thumb.webp',
  });
});

test('toFestivalItem carries a null thumbnail through as imageSrc', () => {
  // CultureContent types thumbnailImageUrl as `string`, but the live API can
  // return null for content without a thumbnail — verify the runtime guard.
  const content = buildContent({
    thumbnailImageUrl: null as unknown as string,
  });

  assert.equal(toFestivalItem(content).imageSrc, null);
});
