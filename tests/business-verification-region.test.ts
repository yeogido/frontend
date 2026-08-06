import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveBusinessRegionId } from '../src/pages/business-verification/regionId.ts';
import type { Region } from '../src/types/region.type';

// GET /api/v1/regions 실제 응답에서 가져온 값이다.
const regions: Region[] = [
  { regionId: 1, name: '서울', imageUrl: '' },
  { regionId: 27, name: '부산', imageUrl: '' },
  { regionId: 80, name: '경기', imageUrl: '' },
  { regionId: 82, name: '충북', imageUrl: '' },
  { regionId: 88, name: '제주', imageUrl: '' },
];

test('resolves the province id from a Kakao short-form address', () => {
  // 카카오 장소 검색은 '부산 수영구 …'처럼 축약형을 준다.
  assert.equal(resolveBusinessRegionId('부산 수영구 광안해변로 219', regions), 27);
});

test('resolves the province id from a full-form address', () => {
  // 명세서 예시는 '서울특별시 강남구 …' 전체 표기를 쓴다.
  assert.equal(
    resolveBusinessRegionId('서울특별시 강남구 테헤란로 123', regions),
    1
  );
});

test('resolves provinces whose short and full names differ', () => {
  assert.equal(resolveBusinessRegionId('경기도 성남시 분당구', regions), 80);
  assert.equal(resolveBusinessRegionId('충청북도 청주시 상당구', regions), 82);
  assert.equal(resolveBusinessRegionId('제주특별자치도 제주시', regions), 88);
});

test('returns undefined for an address whose province cannot be matched', () => {
  // 임의의 ID를 보내면 백엔드가 REGION4041로 거절하므로, 해석 실패는 제출을
  // 막는 신호여야 한다.
  assert.equal(resolveBusinessRegionId('알 수 없는 주소', regions), undefined);
  assert.equal(resolveBusinessRegionId('', regions), undefined);
});

test('returns undefined while the region list is still loading', () => {
  assert.equal(
    resolveBusinessRegionId('부산 수영구 광안해변로 219', undefined),
    undefined
  );
});

test('returns undefined when the matched province is missing from the region list', () => {
  assert.equal(
    resolveBusinessRegionId('대구광역시 중구', regions),
    undefined
  );
});
