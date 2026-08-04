import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findTransportLabel,
  toAgeGroupLabel,
  toCompanionLabel,
  toDurationLabel,
  toGenderLabel,
  toReviewerMetaLabel,
  toTransportLabel,
} from '../src/utils/courseEnumLabels.ts';

test('maps course enums to display labels', () => {
  assert.equal(toDurationLabel('TWO_NIGHT'), '2박 3일');
  assert.equal(toTransportLabel('CAR'), '자동차');
  assert.equal(toCompanionLabel('COUPLE'), '연인과');
});

test('accepts the alternate enum spellings the backend also returns', () => {
  assert.equal(toDurationLabel('TWO_NIGHTS_THREE_DAYS'), '2박 3일');
  // Swagger enum에는 없지만 실제 응답에 존재한다.
  assert.equal(toTransportLabel('PUBLIC'), '대중교통');
  assert.equal(toCompanionLabel('ALONE'), '혼자');
});

test('falls back to the raw value for unknown course enums', () => {
  assert.equal(toDurationLabel('FIVE_NIGHTS'), 'FIVE_NIGHTS');
  assert.equal(toTransportLabel('BICYCLE'), 'BICYCLE');
  assert.equal(findTransportLabel('BICYCLE'), undefined);
});

test('maps both age group enum sets the backend documents', () => {
  // Swagger는 TEENS~HUNDRED_PLUS, 명세서는 TEEN~FIFTIES_PLUS로 서로 다르다.
  assert.equal(toAgeGroupLabel('TEENS'), '10대');
  assert.equal(toAgeGroupLabel('TEEN'), '10대');
  assert.equal(toAgeGroupLabel('FIFTIES'), '50대');
  assert.equal(toAgeGroupLabel('FIFTIES_PLUS'), '50대 이상');
  assert.equal(toAgeGroupLabel('HUNDRED_PLUS'), '100대 이상');
});

test('blanks out unknown age group and gender instead of leaking the enum', () => {
  assert.equal(toAgeGroupLabel('UNBORN'), '');
  assert.equal(toAgeGroupLabel(undefined), '');
  assert.equal(toGenderLabel('OTHER'), '');
  assert.equal(toGenderLabel(undefined), '');
});

test('builds the reviewer meta label from the fields that are available', () => {
  assert.equal(toReviewerMetaLabel('TWENTIES', 'FEMALE'), '20대 여');
  // 리뷰 조회 응답에 성별이 없는 현재 상태.
  assert.equal(toReviewerMetaLabel('THIRTIES'), '30대');
  assert.equal(toReviewerMetaLabel(undefined), '');
});
