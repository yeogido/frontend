import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const dialogSource = readFileSync(
  new URL(
    '../src/pages/business-verification/components/BusinessVerificationSuccessDialog.tsx',
    import.meta.url
  ),
  'utf8'
);

test('moves focus into the dialog when it opens', () => {
  // aria-modal은 포커스를 옮겨주지 않는다. 직접 옮기지 않으면 배경의
  // '사업자 인증하기' 버튼에 포커스가 남는다.
  assert.match(dialogSource, /confirmButtonRef\.current\?\.focus\(\)/);
  assert.match(dialogSource, /ref=\{confirmButtonRef\}/);
});

test('keeps focus inside while the dialog is open', () => {
  // Tab만 막으면 키 이벤트를 거치지 않는 경로로 포커스가 샌다.
  // focusin을 함께 감시해 밖으로 나간 포커스를 끌어온다.
  assert.match(dialogSource, /addEventListener\('focusin'/);
  assert.match(dialogSource, /dialog\.contains\(event\.target as Node\)/);
  assert.match(dialogSource, /event\.key === 'Tab'/);
  assert.match(dialogSource, /event\.preventDefault\(\)/);
});

test('restores focus to the opener when the dialog closes', () => {
  assert.match(dialogSource, /previouslyFocused/);
});

test('does not re-run the focus effect on every parent render', () => {
  // onConfirm은 부모가 매 렌더 새로 만든다. 의존성에 넣으면 리렌더마다
  // 포커스를 확인 버튼으로 되돌려 버린다.
  assert.match(dialogSource, /onConfirmRef/);
  assert.doesNotMatch(dialogSource, /\}, \[isOpen, onConfirm\]\)/);
});
