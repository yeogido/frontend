import assert from 'node:assert/strict';
import test from 'node:test';

import { getDropdownPanelPosition } from '../src/pages/profile/edit/dropdownPosition.ts';

test('opens the dropdown above its trigger when there is not enough space below', () => {
  const position = getDropdownPanelPosition({
    triggerTop: 650,
    triggerBottom: 696,
    viewportHeight: 844,
    preferredHeight: 184,
    gap: 4,
    viewportInset: 8,
  });

  assert.deepEqual(position, { top: 462, height: 184 });
});

test('keeps the dropdown below its trigger when it fits in the viewport', () => {
  const position = getDropdownPanelPosition({
    triggerTop: 400,
    triggerBottom: 446,
    viewportHeight: 844,
    preferredHeight: 184,
    gap: 4,
    viewportInset: 8,
  });

  assert.deepEqual(position, { top: 450, height: 184 });
});
