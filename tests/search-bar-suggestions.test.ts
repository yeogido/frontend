import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldOpenSuggestionsOnMount } from '../src/components/common/searchBarUtils.ts';

test('opens the suggestion list for an empty initial search when requested', () => {
  assert.equal(shouldOpenSuggestionsOnMount(true, '', true), true);
  assert.equal(shouldOpenSuggestionsOnMount(true, '마포구', true), false);
  assert.equal(shouldOpenSuggestionsOnMount(true, '', false), false);
});
