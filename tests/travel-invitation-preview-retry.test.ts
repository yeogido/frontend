import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldRetryInvitationPreview } from '../src/pages/travel-record/utils/invitationPreviewRetry.ts';

test('retries a transient preview failure only once', () => {
  assert.equal(shouldRetryInvitationPreview(0, { status: 503 }), true);
  assert.equal(shouldRetryInvitationPreview(1, { status: 503 }), false);
});

test('does not retry rejected or expired invitations', () => {
  for (const status of [401, 403, 404]) {
    assert.equal(shouldRetryInvitationPreview(0, { status }), false);
  }
});
