import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import {
  mapKakaoPlaceToItem,
  searchPlaces,
} from '../src/pages/local-recommendation/place-selection/placeSearch.ts';

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

function installKakaoPlacesMock(
  status: 'OK' | 'ZERO_RESULT' | 'ERROR',
  data: typeof fakeKakaoPlaceResult[] = [fakeKakaoPlaceResult]
) {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {},
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      kakao: {
        maps: {
          load: (callback: () => void) => callback(),
          services: {
            Places: class {
              keywordSearch(
                _query: string,
                callback: (
                  results: typeof fakeKakaoPlaceResult[],
                  resultStatus: 'OK' | 'ZERO_RESULT' | 'ERROR'
                ) => void
              ) {
                callback(data, status);
              }
            },
            Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT', ERROR: 'ERROR' },
          },
        },
      },
    },
  });
}

test.afterEach(() => {
  Reflect.deleteProperty(globalThis, 'window');
  Reflect.deleteProperty(globalThis, 'document');
});

test('searchPlaces maps Kakao OK responses to place items', async () => {
  installKakaoPlacesMock('OK');

  const results = await searchPlaces('광안리');

  assert.equal(results.length, 1);
  assert.equal(results[0]?.title, '광안리 해수욕장');
});

test('searchPlaces returns an empty array for Kakao ZERO_RESULT responses', async () => {
  installKakaoPlacesMock('ZERO_RESULT', []);

  assert.deepEqual(await searchPlaces('없는 장소'), []);
});

test('searchPlaces rejects Kakao error responses', async () => {
  installKakaoPlacesMock('ERROR');

  await assert.rejects(searchPlaces('광안리'));
});

test('searchPlaces rejects when the Kakao SDK cannot load', async () => {
  await assert.rejects(searchPlaces('광안리'));
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
