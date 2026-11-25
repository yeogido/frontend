import type { TravelRecordReceivedInvitation } from '../../types/travelRecord.type';

export interface InvitationPromptHistory {
  createdAt: number;
  id: number;
}

const cursorOf = (
  item: TravelRecordReceivedInvitation
): InvitationPromptHistory => ({
  createdAt: Date.parse(item.createdAt),
  id: item.invitationId,
});

const validCursor = (cursor: InvitationPromptHistory) =>
  Number.isFinite(cursor.createdAt) &&
  cursor.createdAt > 0 &&
  Number.isSafeInteger(cursor.id) &&
  cursor.id > 0;

const compare = (a: InvitationPromptHistory, b: InvitationPromptHistory) =>
  a.createdAt - b.createdAt || a.id - b.id;

export const invitationPromptHistoryKey = (userId: number) =>
  `travel-invitation-dismissed:${userId}`;

export function getNextInvitationPrompt(
  items: TravelRecordReceivedInvitation[],
  history: InvitationPromptHistory | null,
  activeId?: number | null
): TravelRecordReceivedInvitation | undefined {
  const pending = items.filter(
    (item) => item.status === 'PENDING' && validCursor(cursorOf(item))
  );
  const active = pending.find((item) => item.invitationId === activeId);
  if (active) return active;
  return pending.reduce<TravelRecordReceivedInvitation | undefined>(
    (newest, item) => {
      const cursor = cursorOf(item);
      if (history && compare(cursor, history) <= 0) return newest;
      return !newest || compare(cursor, cursorOf(newest)) > 0 ? item : newest;
    },
    undefined
  );
}

export function dismissInvitationBatch(
  items: TravelRecordReceivedInvitation[],
  history: InvitationPromptHistory | null
) {
  // A watermark also suppresses older invitations on pages not loaded yet.
  return items.reduce<InvitationPromptHistory | null>((latest, item) => {
    const cursor = cursorOf(item);
    return validCursor(cursor) && (!latest || compare(cursor, latest) > 0)
      ? cursor
      : latest;
  }, history);
}

export function parseInvitationPromptHistory(
  value: string | null
): InvitationPromptHistory | null {
  try {
    const parsed: unknown = JSON.parse(value ?? 'null');
    if (typeof parsed !== 'object' || !parsed) return null;
    const { id, createdAt } = parsed as InvitationPromptHistory;
    return validCursor({ id, createdAt }) ? { id, createdAt } : null;
  } catch {
    return null;
  }
}

export function isInvitationPromptRouteSafe(pathname: string) {
  return ![
    /^\/(login|signup|auth|forgot-password)(\/|$)/,
    /^\/travel-record\/(new|date-selection|photo-selection|folder-decoration)(\/|$)/,
    /^\/travel-record\/[^/]+\/edit(\/|$)/,
    /^\/(local-recommendation|admin|business-promotion-registration|business-verification|review)(\/|$)/,
    /^\/profile\/edit(\/|$)/,
  ].some((pattern) => pattern.test(pathname));
}
