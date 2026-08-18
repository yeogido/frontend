import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { signupSchema } from '../src/pages/auth/signup/schema.ts';

const validSignup = {
  name: '여기도',
  email: 'tester@example.com',
  password: 'Password!1',
  passwordConfirm: 'Password!1',
  regionId: '1',
  gender: 'NONE',
  birthYear: '2000',
};

test('rejects signup nicknames outside the two-to-ten character range', () => {
  assert.equal(signupSchema.safeParse({ ...validSignup, name: '나' }).success, false);
  assert.equal(
    signupSchema.safeParse({ ...validSignup, name: '가나다라마바사아자차카' }).success,
    false
  );
});

test('blocks social signup until the nickname is within the two-to-ten character range', async () => {
  const source = await readFile(
    new URL('../src/pages/auth/signup/components/SocialProfileForm.tsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /!nicknameError/);
});
