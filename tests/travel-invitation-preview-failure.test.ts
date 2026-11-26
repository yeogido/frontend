import assert from 'node:assert/strict';
import test from 'node:test';
import { getInvitationPreviewFailureAction } from '../src/pages/travel-record/utils/invitationPreviewFailure.ts';

test('an invalid automatic invitation is skipped while other invitations remain eligible', () => {
  assert.equal(
    getInvitationPreviewFailureAction(true, { status: 404 }),
    'skip'
  );
  assert.equal(
    getInvitationPreviewFailureAction(true, { code: 'TRAVEL_RECORD4042' }),
    'skip'
  );
  assert.equal(
    getInvitationPreviewFailureAction(true, { status: 503 }),
    'wait'
  );
});

test('a manually opened invitation resets after failure so it can be opened again', () => {
  assert.equal(
    getInvitationPreviewFailureAction(false, { status: 503 }),
    'reset'
  );
  assert.equal(
    getInvitationPreviewFailureAction(false, { status: 404 }),
    'reset'
  );
});
