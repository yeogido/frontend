import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getApiErrorMessage,
  normalizeApiError,
} from '../src/apis/common/apiError.ts';

const fallbackMessage = '여행 기록을 저장하지 못했어요.';

test('keeps the HTTP status when an already normalized error is re-normalized', () => {
  // apiClient 인터셉터가 정규화한 에러가 각 API 함수의 catch를 거쳐 다시
  // 들어온다. 이때 status를 잃으면 호출부에서 404 분기를 할 수 없다.
  assert.deepEqual(
    normalizeApiError({
      code: 'TRAVEL_RECORD4041',
      message: '여행 기록을 찾을 수 없습니다.',
      status: 404,
    }),
    {
      code: 'TRAVEL_RECORD4041',
      message: '여행 기록을 찾을 수 없습니다.',
      status: 404,
    },
  );
});

test('surfaces the server error message so the failure reason is visible', () => {
  assert.equal(
    getApiErrorMessage(
      {
        code: 'TRAVEL_RECORD4002',
        message: '여행 기록 사진은 최대 5장까지 등록할 수 있습니다.',
        status: 400,
      },
      fallbackMessage,
    ),
    '여행 기록 사진은 최대 5장까지 등록할 수 있습니다.',
  );
});

test('falls back for client-side errors whose message is not user facing', () => {
  assert.equal(
    getApiErrorMessage(new Error('Network Error'), fallbackMessage),
    fallbackMessage,
  );
  assert.equal(
    getApiErrorMessage(
      { code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' },
      fallbackMessage,
    ),
    fallbackMessage,
  );
});

test('falls back when the server responded without a business error code', () => {
  assert.equal(
    getApiErrorMessage(
      {
        code: 'HTTP_500',
        message: 'Request failed with status code 500',
        status: 500,
      },
      fallbackMessage,
    ),
    fallbackMessage,
  );
});
