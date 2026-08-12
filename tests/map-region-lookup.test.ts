import assert from 'node:assert/strict';
import test from 'node:test';

import { findMapRegion } from '../src/pages/home/map/utils/regionCodeLookup.ts';

test('prefers the province shape when a name exists as both province and city', () => {
  // 지도 데이터에 '세종특별자치시'가 도(36)와 시(4473, 충남 접두사) 양쪽에
  // 있다. 시를 잡으면 세종 기록이 충남 소속 도형에 붙는다.
  assert.deepEqual(findMapRegion({ name: '세종', fullName: '세종특별자치시' }), {
    name: '세종특별자치시',
    code: '36',
  });
});

test('falls back to the parent shape for districts the map data lacks', () => {
  // 인천 검단구는 최근 신설돼 지도 데이터에 없다. 폴백이 없으면 regionCode가
  // 비어 사진이 지도에서 사라진다.
  const match = findMapRegion({
    name: '검단구',
    fullName: '인천광역시 검단구',
  });

  assert.equal(match?.code, '28');
});

test('falls back to the parent city for eup/myeon/dong level regions', () => {
  // 지도 데이터에는 읍·면·동 도형이 없다.
  assert.equal(
    findMapRegion({
      name: '구좌읍',
      fullName: '제주특별자치도 제주시 구좌읍',
    })?.code,
    '5011',
  );
  assert.equal(
    findMapRegion({ name: '고운동', fullName: '세종특별자치시 고운동' })?.code,
    '36',
  );
});

test('still resolves ordinary cities and districts directly', () => {
  assert.equal(
    findMapRegion({ name: '여수시', fullName: '전라남도 여수시' })?.code,
    '4613',
  );
  assert.equal(
    findMapRegion({ name: '강남구', fullName: '서울특별시 강남구' })?.code,
    '1168',
  );
});

test('still disambiguates duplicate district names by province', () => {
  assert.equal(
    findMapRegion({ name: '중구', fullName: '부산광역시 중구' })?.code,
    '2611',
  );
  assert.equal(
    findMapRegion({ name: '중구', fullName: '대구광역시 중구' })?.code,
    '2711',
  );
});

test('returns null when there is nothing to match', () => {
  assert.equal(findMapRegion({}), null);
  assert.equal(findMapRegion({ name: '없는지역' }), null);
});
