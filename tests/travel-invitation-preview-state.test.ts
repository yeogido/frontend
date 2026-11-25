import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldHandleInvitationPreviewFailure } from '../src/pages/travel-record/utils/invitationPreviewState.ts';

test('keeps an existing preview on a temporary refetch failure', () => {
  assert.equal(
    shouldHandleInvitationPreviewFailure(true, { status: 503 }),
    false
  );
});
test('handles initial failures and invalid invitations even with cached data', () => {
  assert.equal(
    shouldHandleInvitationPreviewFailure(false, { status: 503 }),
    true
  );
  assert.equal(
    shouldHandleInvitationPreviewFailure(true, { code: 'TRAVEL_RECORD4042' }),
    true
  );
  assert.equal(
    shouldHandleInvitationPreviewFailure(true, { status: 404 }),
    true
  );
});
