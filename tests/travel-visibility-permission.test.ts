import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { canChangeTravelRecordVisibility } from '../src/pages/travel-record/utils/visibilityPermission.ts';

test('공개범위는 다른 참여자가 없는 생성자만 변경할 수 있다', () => {
  assert.equal(canChangeTravelRecordVisibility(1, 1, false), true);
  assert.equal(canChangeTravelRecordVisibility(1, 1, true), false);
  assert.equal(canChangeTravelRecordVisibility(1, 2, false), false);
  assert.equal(canChangeTravelRecordVisibility(1, null, false), false);
  assert.equal(canChangeTravelRecordVisibility(1, 1, undefined), false);
});
