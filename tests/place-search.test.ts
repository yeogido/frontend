import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import { filterPlaceItems } from '../src/pages/local-recommendation/place-selection/placeSearch.ts';
import { referencePlaces } from '../src/pages/local-recommendation/place-selection/constants/referencePlaces.ts';

test('place search returns matching ids for distinct place names and addresses', () => {
  assert.deepEqual(
    filterPlaceItems(referencePlaces, '  광안리해수욕장  ').map((place) => place.id),
    ['gwangalli-beach']
  );
  assert.deepEqual(
    filterPlaceItems(referencePlaces, '해운대').map((place) => place.id),
    ['haeundae-beach']
  );
  assert.deepEqual(
    filterPlaceItems(referencePlaces, '감내2로').map((place) => place.id),
    ['gamcheon-culture-village']
  );
});

test('place search returns no results for an empty query', () => {
  assert.deepEqual(filterPlaceItems(referencePlaces, '   '), []);
});

test('place selection uses shared UI, preserves added places as pending, and registers its route', () => {
  const pagePath = new URL(
    '../src/pages/local-recommendation/place-selection/index.tsx',
    import.meta.url
  );
  const routerPath = new URL('../src/router/AppRouter.tsx', import.meta.url);

  assert.ok(existsSync(pagePath));

  const pageSource = readFileSync(pagePath, 'utf8');
  const routerSource = readFileSync(routerPath, 'utf8');

  assert.match(pageSource, /<SelectionPageLayout/);
  assert.match(pageSource, /<SelectedItemsSheet/);
  assert.match(pageSource, /useState<PlaceItem \| null>\(null\)/);
  assert.match(pageSource, /setPendingPlace\(place\)/);
  assert.match(routerSource, /path="\/local-recommendation\/place-selection"/);
});
