import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR,
  getDefaultProfileAvatarIconStyle,
} from '../src/components/common/defaultProfileAvatar.ts';

test('uses the profile page fallback avatar proportions at every size', () => {
  assert.equal(DEFAULT_PROFILE_AVATAR_BACKGROUND_COLOR, '#E4E4E4');
  assert.deepEqual(getDefaultProfileAvatarIconStyle(60), {
    top: 2.5,
    width: 60,
    height: 57.5,
  });
});
