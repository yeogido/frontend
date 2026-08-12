import assert from 'node:assert/strict';
import test from 'node:test';

import {
  REGION_IMAGE_ALL_ID,
  REGION_IMAGE_ALL_OPTION,
} from '../src/components/common/RegionImageCarouselOption.ts';

test('defines an image-free nationwide option for the first carousel item', () => {
  assert.deepEqual(REGION_IMAGE_ALL_OPTION, {
    id: REGION_IMAGE_ALL_ID,
    name: '전국',
  });
});
