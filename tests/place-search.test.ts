import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import { mapKakaoPlaceToItem } from '../src/pages/local-recommendation/place-selection/placeSearch.ts';

const fakeKakaoPlaceResult = {
  id: '123456',
  place_name: '광안리 해수욕장',
  category_name: '여행 > 관광,명소 > 해수욕장',
  category_group_code: 'AT4',
  phone: '',
  address_name: '부산 수영구 광안동 192-20',
  road_address_name: '부산 수영구 광안해변로 219',
  x: '129.118666',
  y: '35.1531698',
  place_url: 'http://place.map.kakao.com/123456',
};

test('mapKakaoPlaceToItem maps a Kakao place search result to a PlaceItem', () => {
  const item = mapKakaoPlaceToItem(fakeKakaoPlaceResult);

  assert.deepEqual(item, {
    id: '123456',
    title: '광안리 해수욕장',
    address: '부산 수영구 광안해변로 219',
    imageSrc: null,
    externalPlaceId: '123456',
    categoryGroupCode: 'AT4',
    roadAddress: '부산 수영구 광안해변로 219',
    lotAddress: '부산 수영구 광안동 192-20',
    latitude: 35.1531698,
    longitude: 129.118666,
  });
});

test('mapKakaoPlaceToItem falls back to lot address when road address is missing', () => {
  const item = mapKakaoPlaceToItem({
    ...fakeKakaoPlaceResult,
    road_address_name: '',
  });

  assert.equal(item.address, fakeKakaoPlaceResult.address_name);
  assert.equal(item.roadAddress, '');
});

test('place selection uses shared UI, preserves added places as pending, and registers its route', () => {
  const pagePath = new URL(
    '../src/pages/local-recommendation/place-selection/index.tsx',
    import.meta.url
  );
  const routerPath = new URL('../src/router/AppRouter.tsx', import.meta.url);

  assert.ok(existsSync(pagePath));

  let pageSource = readFileSync(pagePath, 'utf8');
  const searchSectionPath = new URL(
    './components/PlaceSearchSection.tsx',
    pagePath
  );
  const selectedSectionPath = new URL(
    './components/SelectedPlaceSection.tsx',
    pagePath
  );
  const modalHookPath = new URL('./hooks/usePlacePhotoModal.ts', pagePath);

  if (existsSync(searchSectionPath)) {
    pageSource += readFileSync(searchSectionPath, 'utf8');
  }
  if (existsSync(selectedSectionPath)) {
    pageSource += readFileSync(selectedSectionPath, 'utf8');
  }
  if (existsSync(modalHookPath)) {
    pageSource += readFileSync(modalHookPath, 'utf8');
  }

  const routerSource = readFileSync(routerPath, 'utf8');

  assert.match(pageSource, /<SelectionPageLayout/);
  assert.match(pageSource, /<SelectedItemsSheet/);
  assert.match(pageSource, /setPendingPlace/);
  assert.match(routerSource, /path="\/local-recommendation\/place-selection"/);
});
