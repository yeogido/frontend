import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getCourseRegionCityOptions,
  isNationwideCity,
} from '../src/pages/course-region-search/utils/citySelection.ts';
import {
  getNationwideSearchPagePath,
  getNationwideSearchPath,
} from '../src/pages/course-region-search/constants/searchTargets.ts';

test('prepends the nationwide option before city options', () => {
  const cities = [
    { id: 'seoul', name: '서울', imageSrc: '/seoul.png', regionId: 1 },
  ];

  assert.deepEqual(getCourseRegionCityOptions(cities), [
    { id: 'all', name: '전국' },
    ...cities,
  ]);
});

test('recognizes the nationwide city selection', () => {
  assert.equal(isNationwideCity('all'), true);
  assert.equal(isNationwideCity('seoul'), false);
});

test('uses each search target default page for a nationwide selection', () => {
  assert.equal(getNationwideSearchPath('course'), '/yeogido-course');
  assert.equal(getNationwideSearchPath('home'), '/yeogido-course');
  assert.equal(getNationwideSearchPath('local-course'), '/local-course');
  assert.equal(getNationwideSearchPath('festival'), '/festival/search');
});

test('uses each target search page for the pinned nationwide search action', () => {
  assert.equal(getNationwideSearchPagePath('course'), '/yeogido-course/search');
  assert.equal(getNationwideSearchPagePath('home'), '/yeogido-course/search');
  assert.equal(getNationwideSearchPagePath('local-course'), '/local-course/search');
  assert.equal(getNationwideSearchPagePath('festival'), '/festival/search');
});
