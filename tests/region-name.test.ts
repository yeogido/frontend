import assert from 'node:assert/strict';
import test from 'node:test';

import { getFullRegionName } from '../src/utils/regionName.ts';

test('maps every short region name to its official full name', () => {
  const cases: Record<string, string> = {
    서울: '서울특별시',
    부산: '부산광역시',
    대구: '대구광역시',
    인천: '인천광역시',
    광주: '광주광역시',
    대전: '대전광역시',
    울산: '울산광역시',
    세종: '세종특별자치시',
    경기: '경기도',
    강원: '강원특별자치도',
    충북: '충청북도',
    충남: '충청남도',
    전북: '전북특별자치도',
    전남: '전라남도',
    경북: '경상북도',
    경남: '경상남도',
    제주: '제주특별자치도',
  };

  for (const [shortName, fullName] of Object.entries(cases)) {
    assert.equal(getFullRegionName(shortName), fullName);
  }
});

test('falls back to the original value for unknown or already-full names', () => {
  assert.equal(getFullRegionName('서울특별시'), '서울특별시');
  assert.equal(getFullRegionName('알수없음'), '알수없음');
  assert.equal(getFullRegionName(''), '');
});
