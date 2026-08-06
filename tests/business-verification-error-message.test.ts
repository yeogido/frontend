import assert from 'node:assert/strict';
import test from 'node:test';

import {
  VERIFY_ERROR_MESSAGE,
  getBusinessVerificationErrorMessage,
} from '../src/pages/business-verification/errorMessage.ts';

test('shows the server message for errors the user can act on', () => {
  // 국세청 검증 결과는 원인별로 안내가 달라 그대로 보여준다.
  assert.equal(
    getBusinessVerificationErrorMessage({
      code: 'BUSINESS_VERIFY4002',
      message: '입력한 사업자 정보가 국세청 등록 정보와 일치하지 않습니다.',
      status: 400,
    }),
    '입력한 사업자 정보가 국세청 등록 정보와 일치하지 않습니다.'
  );
  assert.equal(
    getBusinessVerificationErrorMessage({
      code: 'BUSINESS_VERIFY4041',
      message: '폐업 상태이거나 존재하지 않는 사업자 번호입니다.',
      status: 404,
    }),
    '폐업 상태이거나 존재하지 않는 사업자 번호입니다.'
  );
  assert.equal(
    getBusinessVerificationErrorMessage({
      code: 'BUSINESS_VERIFY4091',
      message: '이미 등록된 사업자 번호입니다.',
      status: 409,
    }),
    '이미 등록된 사업자 번호입니다.'
  );
});

test('hides payload-level failures behind the fallback message', () => {
  // 필수값 누락과 잘못된 지역 ID는 사용자가 고칠 수 있는 문제가 아니라
  // 프론트가 요청을 잘못 만든 경우다.
  assert.equal(
    getBusinessVerificationErrorMessage({
      code: 'COMMON4001',
      message: '필수 입력값 누락 등 잘못된 요청입니다.',
      status: 400,
    }),
    VERIFY_ERROR_MESSAGE
  );
  assert.equal(
    getBusinessVerificationErrorMessage({
      code: 'REGION4041',
      message: '전달한 지역 ID가 존재하지 않습니다.',
      status: 404,
    }),
    VERIFY_ERROR_MESSAGE
  );
});

test('keeps the region resolution message raised before the request is sent', () => {
  // 평범한 Error로 던지면 UNKNOWN_ERROR로 분류돼 문구가 사라지므로,
  // code를 달아 서버 에러와 같은 경로로 흐르는지 확인한다.
  const error = Object.assign(
    new Error('사업장 지역을 확인하지 못했어요. 장소를 다시 선택해 주세요.'),
    { code: 'REGION_UNRESOLVED' }
  );

  assert.equal(
    getBusinessVerificationErrorMessage(error),
    '사업장 지역을 확인하지 못했어요. 장소를 다시 선택해 주세요.'
  );
});

test('falls back for network failures that carry a technical message', () => {
  assert.equal(
    getBusinessVerificationErrorMessage(new Error('Network Error')),
    VERIFY_ERROR_MESSAGE
  );
});
