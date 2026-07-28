import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_TOAST_DURATION,
  createToast,
} from '../src/components/toast/toastState.ts';

test('creates a toast with the default visibility duration', () => {
  assert.deepEqual(createToast('업로드할 수 있는 스티커 수를 초과했어요.'), {
    id: 1,
    message: '업로드할 수 있는 스티커 수를 초과했어요.',
    duration: DEFAULT_TOAST_DURATION,
  });
});

test('accepts an explicit visibility duration for a toast', () => {
  assert.equal(createToast('저장했어요.', 1200).duration, 1200);
});
