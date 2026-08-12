import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getStoredRecentSearches,
  removeStoredRecentSearch,
} from '../src/utils/recentSearches.ts';

test('returns no suggestions when a recent-search storage has no saved entries', () => {
  assert.deepEqual(
    getStoredRecentSearches({ storageKey: 'missing-recent-searches' }),
    []
  );
});

test('removes only the selected recent search', () => {
  assert.deepEqual(
    removeStoredRecentSearch('부산', {
      storageKey: 'recent-searches',
      currentSearches: ['서울', '부산', '제주'],
    }),
    ['서울', '제주']
  );
});
