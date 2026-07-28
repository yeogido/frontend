import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_TOAST_DURATION,
  createToast,
} from '../src/components/toast/toastState.ts';

test('creates a toast with the default visibility duration', () => {
  const message = 'toast-message';
  const toast = createToast(message);

  assert.equal(typeof toast.id, 'number');
  assert.equal(toast.message, message);
  assert.equal(toast.duration, DEFAULT_TOAST_DURATION);
});

test('accepts an explicit visibility duration for a toast', () => {
  assert.equal(createToast('toast-message', 1200).duration, 1200);
});
