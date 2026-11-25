import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getNextInvitationPrompt,
  dismissInvitationBatch,
  parseInvitationPromptHistory,
  isInvitationPromptRouteSafe,
} from '../src/hooks/utils/travelInvitationPrompts.ts';
import type { TravelRecordReceivedInvitation } from '../src/types/travelRecord.type';

const invitation = (id: number, createdAt = '2026-11-15T12:00:00') =>
  ({
    invitationId: id,
    createdAt,
    status: 'PENDING',
  }) as TravelRecordReceivedInvitation;

test('orders invitations by creation time then ID and keeps the open invitation stable', () => {
  const older = invitation(10, '2026-11-14T12:00:00');
  const current = invitation(11);
  const latest = invitation(12);
  assert.equal(
    getNextInvitationPrompt([older, current, latest], null)?.invitationId,
    12
  );
  assert.equal(
    getNextInvitationPrompt([older, current, latest], null, 11)?.invitationId,
    11
  );
  assert.equal(
    getNextInvitationPrompt([older, latest], null, 11)?.invitationId,
    12
  );
});

test('skips an invalid newest invitation and selects the next pending one', () => {
  assert.equal(
    getNextInvitationPrompt(
      [invitation(20), invitation(19)],
      null,
      null,
      new Set(['20'])
    )?.invitationId,
    19
  );
});

test('closing suppresses the whole current batch including older pages, but allows future invitations', () => {
  const history = dismissInvitationBatch(
    [invitation(12), invitation(11)],
    null
  );
  assert.equal(
    getNextInvitationPrompt([invitation(12), invitation(9)], history),
    undefined
  );
  assert.equal(
    getNextInvitationPrompt([invitation(13), invitation(12)], history)
      ?.invitationId,
    13
  );
  assert.deepEqual(dismissInvitationBatch([invitation(9)], history), history);
  assert.equal(
    getNextInvitationPrompt([invitation(11)], null)?.invitationId,
    11
  );
});

test('resolved or malformed invitations are never automatically opened', () => {
  assert.equal(
    getNextInvitationPrompt(
      [
        { ...invitation(12), status: 'DECLINED' },
        { ...invitation(13), status: 'ACCEPTED' },
        invitation(0),
        invitation(14, 'invalid'),
      ],
      null
    ),
    undefined
  );
});

test('dismissal history survives serialization and invalid storage does not suppress real invitations', () => {
  const history = dismissInvitationBatch([invitation(12)], null);
  assert.equal(history?.id, 12);
  assert.deepEqual(
    parseInvitationPromptHistory('{"createdAt":1770000000000,"id":12}'),
    { createdAt: 1770000000000, id: 12 }
  );
  assert.deepEqual(
    parseInvitationPromptHistory(JSON.stringify(history)),
    history
  );
  for (const value of [
    null,
    '',
    '{',
    '{}',
    'null',
    '{"id":-1,"createdAt":0}',
  ]) {
    assert.equal(parseInvitationPromptHistory(value), null);
  }
});

test('defers prompts on editing and authentication routes while allowing ordinary pages', () => {
  for (const path of [
    '/travel-record/new',
    '/travel-record/date-selection',
    '/travel-record/20/edit/photos',
    '/local-recommendation/tag-selection',
    '/admin/course-registration/preview',
    '/business-promotion-registration/2/edit',
    '/profile/edit',
    '/review',
    '/signup/kakao',
    '/auth/kakao/callback',
    '/login',
  ]) {
    assert.equal(isInvitationPromptRouteSafe(path), false, path);
  }
  for (const path of [
    '/',
    '/travel-record',
    '/travel-record/20',
    '/friends',
    '/festival',
    '/local-course/detail/2',
    '/profile',
  ]) {
    assert.equal(isInvitationPromptRouteSafe(path), true, path);
  }
});
