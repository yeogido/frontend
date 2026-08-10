import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createUnsavedChangesHistoryState,
  getInternalNavigationPath,
  getUnsavedChangesHistoryOffset,
  isUnsavedChangesHistoryState,
} from '../src/pages/profile/hooks/useUnsavedChangesGuard.ts';

test('returns a same-origin navigation path', () => {
  assert.equal(
    getInternalNavigationPath(
      'https://yeogido.test/local-course?sort=popular#reviews',
      'https://yeogido.test'
    ),
    '/local-course?sort=popular#reviews'
  );
});

test('does not intercept an external navigation path', () => {
  assert.equal(
    getInternalNavigationPath(
      'https://example.com/',
      'https://yeogido.test'
    ),
    null
  );
});

test('marks a duplicated history entry as an unsaved-changes safety entry', () => {
  const state = createUnsavedChangesHistoryState({ key: 'existing-entry' });

  assert.equal(isUnsavedChangesHistoryState(state), true);
  assert.equal(state.key, 'existing-entry');
});

test('restores the safety entry on cancel and skips it on confirmed back navigation', () => {
  assert.equal(getUnsavedChangesHistoryOffset('restore'), 1);
  assert.equal(getUnsavedChangesHistoryOffset('leave'), -2);
});
