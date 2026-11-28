import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SNS_ACCOUNT_ERROR_MESSAGE,
  isValidSnsAccountInput,
  normalizeSnsAccount,
} from '../src/pages/business-promotion-registration/promotion-info/snsAccount.ts';

test('an address without a scheme gets https://', () => {
  assert.equal(isValidSnsAccountInput('instagram.com/a'), true);
  assert.equal(
    normalizeSnsAccount('instagram.com/a'),
    'https://instagram.com/a'
  );
});

test('an address that already has a scheme is not prefixed twice', () => {
  assert.equal(isValidSnsAccountInput('https://instagram.com/a'), true);
  assert.equal(
    normalizeSnsAccount('https://instagram.com/a'),
    'https://instagram.com/a'
  );
  assert.equal(
    normalizeSnsAccount('http://instagram.com/a'),
    'http://instagram.com/a'
  );
});

test('the scheme check ignores case', () => {
  assert.equal(isValidSnsAccountInput('HTTPS://x.com/a'), true);
  assert.equal(normalizeSnsAccount('HTTPS://x.com/a'), 'HTTPS://x.com/a');
  assert.equal(normalizeSnsAccount('Http://x.com/a'), 'Http://x.com/a');
});

test('surrounding spaces are removed', () => {
  assert.equal(isValidSnsAccountInput(' instagram.com/x '), true);
  assert.equal(
    normalizeSnsAccount(' instagram.com/x '),
    'https://instagram.com/x'
  );
});

test('an empty input is allowed and sends nothing', () => {
  assert.equal(isValidSnsAccountInput(''), true);
  assert.equal(isValidSnsAccountInput('   '), true);
  assert.equal(normalizeSnsAccount(''), undefined);
  assert.equal(normalizeSnsAccount('   '), undefined);
});

test('a handle, a spaced text or a text without a dot is not an address', () => {
  assert.equal(isValidSnsAccountInput('@abc'), false);
  assert.equal(isValidSnsAccountInput('a b'), false);
  assert.equal(isValidSnsAccountInput('abc'), false);
  assert.equal(isValidSnsAccountInput('instagram.com/ a'), false);
  assert.equal(isValidSnsAccountInput('https://'), false);
  assert.equal(isValidSnsAccountInput('.com'), false);
  assert.equal(isValidSnsAccountInput('insta@gram.com/a'), false);
});

test('a bare domain is accepted', () => {
  assert.equal(isValidSnsAccountInput('instagram.com'), true);
  assert.equal(normalizeSnsAccount('instagram.com'), 'https://instagram.com');
});

test('the error message asks for a link', () => {
  assert.equal(
    SNS_ACCOUNT_ERROR_MESSAGE,
    'SNS 주소를 링크 형태로 입력해 주세요. (예: instagram.com/아이디)'
  );
});
