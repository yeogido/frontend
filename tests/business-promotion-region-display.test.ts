import assert from 'node:assert/strict';
import test from 'node:test';

import { toRegionDisplayName } from '../src/pages/local-business/mappers/businessPromotionMapper.ts';

// 실제 API(GET /business-promotions, GET /regions/{regionId}/sub-regions)로
// 확인한 값 기반. regionName은 sub-region(구/군/시/읍/면/동) 이름이 내려오고,
// 17개 시/도 전부 확인한 결과 어느 sub-region도 자기 시/도명과 같은 이름을
// 갖지 않는다 — 다만 향후 데이터 변경 대비용 방어 로직은 케이스 2/3/5로 검증한다.

test('일반 지역: 시/도 + 구/군을 합쳐서 반환한다 (인천 계양구, 실API 값)', () => {
  assert.equal(
    toRegionDisplayName('계양구', '인천 계양구 임학동로56번길 3'),
    '인천광역시 계양구'
  );
});

test('세종: sub-region은 동 단위라 정상적으로 합쳐진다 (실API: 고운동 등 14개 동, 시/도명과 겹치는 항목 없음)', () => {
  assert.equal(toRegionDisplayName('고운동', '세종 가름로 200'), '세종특별자치시 고운동');
});

test('세종: regionName이 (드문 경우) 시/도명 자체로 내려오면 중복 없이 시/도명만 반환한다', () => {
  assert.equal(toRegionDisplayName('세종', '세종 가름로 200'), '세종특별자치시');
  assert.equal(
    toRegionDisplayName('세종특별자치시', '세종 가름로 200'),
    '세종특별자치시'
  );
});

test('제주: sub-region에 "제주시"/"서귀포시"가 있어 정상적으로 합쳐진다 (실API 확인)', () => {
  assert.equal(
    toRegionDisplayName('제주시', '제주 제주시 첨단로 242'),
    '제주특별자치도 제주시'
  );
  assert.equal(
    toRegionDisplayName('서귀포시', '제주 서귀포시 중정로 22'),
    '제주특별자치도 서귀포시'
  );
});

test('roadAddress가 빈 문자열이면 regionName을 그대로 반환한다', () => {
  assert.equal(toRegionDisplayName('계양구', ''), '계양구');
  assert.equal(toRegionDisplayName('계양구', '   '), '계양구');
});

test('roadAddress는 축약형("세종")인데 regionName이 정식형("세종특별자치시")이어도 중복 없이 시/도명만 반환한다', () => {
  assert.equal(
    toRegionDisplayName('세종특별자치시', '세종 가름로 200'),
    '세종특별자치시'
  );
});

test('roadAddress는 정식형이 될 수 없지만(항상 축약형), regionName이 축약형("세종")으로 내려오는 반대 경우도 중복 없이 처리한다', () => {
  assert.equal(toRegionDisplayName('세종', '세종 가름로 200'), '세종특별자치시');
});
