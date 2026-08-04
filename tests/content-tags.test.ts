import assert from 'node:assert/strict';
import test from 'node:test';

import {
  toContentTagId,
  toContentTagIds,
} from '../src/utils/contentTags.ts';

test('excludes inherited object keys from content tags', () => {
  assert.equal(toContentTagId('toString'), undefined);
  assert.equal(toContentTagId('constructor'), undefined);
  assert.deepEqual(toContentTagIds(['toString', 'constructor']), []);
});
