import assert from 'node:assert/strict';
import test from 'node:test';

import { getDraggingPhotoPreviewPosition } from '../src/pages/travel-record/photo-selection/draggingPhotoPreviewPosition.ts';

test('positions a dragging preview at the same viewport point as the source photo', () => {
  assert.deepEqual(
    getDraggingPhotoPreviewPosition({
      pointerX: 228,
      pointerY: 514,
      offsetX: 19,
      offsetY: 43,
    }),
    { left: 209, top: 471 },
  );
});
