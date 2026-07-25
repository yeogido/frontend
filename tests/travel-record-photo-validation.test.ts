import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_PHOTO_FILE_SIZE,
  validateTravelRecordPhotos,
} from '../src/pages/travel-record/photo-selection/photoValidation.ts';

const createFile = (type: string, size: number) => ({ type, size }) as File;

test('여행 기록 사진은 남은 선택 수만큼만 추가한다', () => {
  const result = validateTravelRecordPhotos(
    [
      createFile('image/jpeg', 100),
      createFile('image/png', 100),
      createFile('image/webp', 100),
    ],
    2,
  );

  assert.equal(result.files.length, 2);
  assert.equal(result.message, '사진은 최대 5장까지 선택할 수 있어요');
});

test('여행 기록 사진은 이미지 형식과 파일 용량을 검증한다', () => {
  const invalidTypeResult = validateTravelRecordPhotos(
    [createFile('application/pdf', 100)],
    5,
  );
  const oversizedResult = validateTravelRecordPhotos(
    [createFile('image/jpeg', MAX_PHOTO_FILE_SIZE + 1)],
    5,
  );

  assert.equal(invalidTypeResult.files.length, 0);
  assert.equal(invalidTypeResult.message, '이미지 파일만 추가할 수 있어요');
  assert.equal(oversizedResult.files.length, 0);
  assert.equal(oversizedResult.message, '사진은 100MB 이하만 추가할 수 있어요');
});
