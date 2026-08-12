import assert from 'node:assert/strict';
import test from 'node:test';

import { getStoredRecentSearches } from '../src/utils/recentSearches.ts';

test('returns no suggestions when a recent-search storage has no saved entries', () => {
  assert.deepEqual(
    getStoredRecentSearches({ storageKey: 'missing-recent-searches' }),
    []
  );
});
