import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import {
  filterFestivalApiItems,
  normalizeFestivalTag,
} from '../src/pages/local-recommendation/event-selection/festivalSearch.ts';

test('persistent event sheet is non-modal and cannot dismiss below its minimum snap point', () => {
  const sheetPath = new URL(
    '../src/pages/local-recommendation/event-selection/components/SelectedEventSheet.tsx',
    import.meta.url
  );

  assert.ok(existsSync(sheetPath));

  const source = readFileSync(sheetPath, 'utf8');

  assert.match(source, /from 'react-modal-sheet'/);
  assert.match(source, /<Sheet\.Container/);
  assert.match(source, /<Sheet\.Header/);
  assert.match(source, /<Sheet\.Content/);
  assert.match(source, /<Sheet\.Scroller/);
  assert.match(source, /disableScrollLocking/);
  assert.match(source, /dragVelocityThreshold=\{Number\.POSITIVE_INFINITY\}/);
  assert.match(source, /initialSnap=\{MINIMUM_SNAP_INDEX\}/);
  assert.match(source, /snapTo\(MINIMUM_SNAP_INDEX\)/);
  assert.doesNotMatch(source, /modalEffectRootId/);
  assert.doesNotMatch(source, /<Sheet\.Backdrop/);
});

test('event selection uses the shared selection UI and submits to place selection', () => {
  const eventPagePath = new URL(
    '../src/pages/local-recommendation/event-selection/index.tsx',
    import.meta.url
  );
  const layoutPath = new URL(
    '../src/pages/local-recommendation/components/SelectionPageLayout.tsx',
    import.meta.url
  );
  const sheetPath = new URL(
    '../src/pages/local-recommendation/components/SelectedItemsSheet.tsx',
    import.meta.url
  );
  const eventPageSource = readFileSync(eventPagePath, 'utf8');

  assert.ok(existsSync(layoutPath));
  assert.ok(existsSync(sheetPath));
  assert.match(eventPageSource, /<SelectionPageLayout/);
  assert.match(eventPageSource, /<SelectedItemsSheet/);
  assert.match(eventPageSource, /navigate\('\/local-recommendation\/place-selection'\)/);
});

test('festival tags are normalized regardless of whitespace and case', () => {
  assert.equal(normalizeFestivalTag('  BUSAN Festival  '), 'busan festival');
});

test('festival search matches tag, title, and address', () => {
  const festivals = [
    {
      id: '1',
      tag: 'busan beach',
      title: 'Gwangalli Beach Festival',
      address: 'Busan Suyeong-gu',
    },
    {
      id: '2',
      tag: 'music festival',
      title: 'Rock Festival',
      address: 'Seoul',
    },
  ];

  assert.deepEqual(
    filterFestivalApiItems(festivals, 'music').map((festival) => festival.id),
    ['2']
  );
  assert.deepEqual(
    filterFestivalApiItems(festivals, 'suyeong').map((festival) => festival.id),
    ['1']
  );
});
