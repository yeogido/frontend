import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolveProvinceRegionId,
  resolveSubRegionId,
} from '../src/pages/business-verification/regionId.ts';
import type { Region, SubRegion } from '../src/types/region.type';

// GET /api/v1/regions 실제 응답에서 가져온 값이다.
const regions: Region[] = [
  { regionId: 1, name: '서울', imageUrl: '' },
  { regionId: 27, name: '부산', imageUrl: '' },
  { regionId: 79, name: '세종', imageUrl: '' },
  { regionId: 80, name: '경기', imageUrl: '' },
  { regionId: 82, name: '충북', imageUrl: '' },
  { regionId: 88, name: '제주', imageUrl: '' },
];

// GET /api/v1/regions/27/sub-regions 실제 응답에서 가져온 값이다.
const busanSubRegions: SubRegion[] = [
  { subRegionId: 31, name: '수영구' },
  { subRegionId: 35, name: '해운대구' },
];

// 경기는 일반구를 두지 않고 시·군까지만 내려간다.
const gyeonggiSubRegions: SubRegion[] = [
  { subRegionId: 118, name: '성남시' },
  { subRegionId: 119, name: '수원시' },
];

test('resolves the province id from a Kakao short-form address', () => {
  // 카카오 장소 검색은 '부산 수영구 …'처럼 축약형을 준다.
  assert.equal(
    resolveProvinceRegionId('부산 수영구 광안해변로 219', regions),
    27
  );
});

test('resolves the province id from a full-form address', () => {
  assert.equal(
    resolveProvinceRegionId('서울특별시 강남구 테헤란로 123', regions),
    1
  );
});

test('resolves provinces whose short and full names differ', () => {
  assert.equal(resolveProvinceRegionId('경기도 성남시 분당구', regions), 80);
  assert.equal(resolveProvinceRegionId('충청북도 청주시 상당구', regions), 82);
  assert.equal(resolveProvinceRegionId('제주특별자치도 제주시', regions), 88);
});

test('returns undefined for an address whose province cannot be matched', () => {
  // 임의의 ID를 보내면 백엔드가 REGION4041로 거절하므로, 해석 실패는 제출을
  // 막는 신호여야 한다.
  assert.equal(resolveProvinceRegionId('알 수 없는 주소', regions), undefined);
  assert.equal(resolveProvinceRegionId('', regions), undefined);
});

test('returns undefined while the region list is still loading', () => {
  assert.equal(
    resolveProvinceRegionId('부산 수영구 광안해변로 219', undefined),
    undefined
  );
});

test('resolves the district id from the second address token', () => {
  // 운영 데이터가 시·군·구 단위를 쓴다. '부산 수영구 …' 사업장의 regionId는
  // 광역 27이 아니라 수영구 31이다.
  assert.equal(
    resolveSubRegionId('부산 수영구 광안해변로 219', busanSubRegions),
    31
  );
});

test('resolves a Gyeonggi city even when the address has a general district', () => {
  // 경기는 '성남시'까지만 하위 지역으로 두므로 분당구는 무시된다.
  assert.equal(
    resolveSubRegionId('경기도 성남시 분당구 판교역로 235', gyeonggiSubRegions),
    118
  );
});

test('returns undefined so the caller falls back to the province id', () => {
  // 세종·제주·강원은 하위 지역이 빈 배열로 온다.
  assert.equal(resolveSubRegionId('세종특별자치시 한누리대로 2130', []), undefined);
  assert.equal(
    resolveSubRegionId('부산 수영구 광안해변로 219', undefined),
    undefined
  );
  // 목록에 없는 구는 폴백 대상이다.
  assert.equal(
    resolveSubRegionId('부산 사하구 낙동대로', busanSubRegions),
    undefined
  );
  // 시·도만 있고 구가 없는 주소도 폴백한다.
  assert.equal(resolveSubRegionId('부산', busanSubRegions), undefined);
});
