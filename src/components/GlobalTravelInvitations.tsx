import { useEffect, useMemo, useRef, useState } from 'react';
import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/auth.store';
import {
  getTravelRecordInvitationsQueryKey,
  useTravelRecordInvitations,
} from '../hooks/useTravelRecordInvitations';
import { useRespondToTravelRecordInvitation } from '../hooks/useRespondToTravelRecordInvitation';
import { useTravelInvitationPromptBlocker } from '../hooks/useTravelInvitationPromptBlocker';
import {
  dismissInvitationBatch,
  getNextInvitationPrompt,
  invitationPromptHistoryKey,
  isInvitationPromptRouteSafe,
  parseInvitationPromptHistory,
} from '../hooks/utils/travelInvitationPrompts';
import { mapReceivedTravelRecordInvitation } from '../pages/travel-record/mappers/travelRecordInvitationMapper';
import TravelRecordInvitationDialog from '../pages/travel-record/components/ValidatedTravelInvitationDialog';
import type { TravelRecordReceivedInvitation } from '../types/travelRecord.type';

function InvitationPrompts({
  userId,
  authGeneration,
}: {
  userId: number;
  authGeneration: number;
}) {
  const location = useLocation();
  const client = useQueryClient();
  const query = useTravelRecordInvitations();
  const { respond, pendingIds, resolvedIds } =
    useRespondToTravelRecordInvitation();
  const interacting = useTravelInvitationPromptBlocker();
  const mutations = useIsMutating();
  const otherMutations = useIsMutating({
    predicate: (mutation) =>
      mutation.options.mutationKey?.[0] !== 'respondTravelRecordInvitation',
  });
  const queryKey = useMemo(
    () => getTravelRecordInvitationsQueryKey(userId, authGeneration),
    [userId, authGeneration]
  );
  const [history, setHistory] = useState(() => {
    try {
      return parseInvitationPromptHistory(
        sessionStorage.getItem(invitationPromptHistoryKey(userId))
      );
    } catch {
      return null;
    }
  });
  const [selected, setSelected] =
    useState<TravelRecordReceivedInvitation | null>(null);
  const [invalidIds, setInvalidIds] = useState<Set<string>>(() => new Set());
  const searchedCursors = useRef(new Set<string>());
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );
  const latestActive = items.find(
    (item) =>
      item.invitationId === selected?.invitationId && item.status === 'PENDING'
  );
  // Absence from a single page doesn't mean the open invitation was resolved.
  const active =
    selected &&
    !resolvedIds.has(String(selected.invitationId)) &&
    !invalidIds.has(String(selected.invitationId))
      ? (latestActive ??
        (query.hasNextPage ||
        query.isFetching ||
        query.isError ||
        query.isPending
          ? selected
          : undefined))
      : undefined;
  const blocked =
    interacting ||
    otherMutations > 0 ||
    !isInvitationPromptRouteSafe(location.pathname);

  // No timer: entry, navigation, focus and reconnect use the shared list query.
  // cancelRefetch=false deduplicates the page observer's simultaneous initial read.
  useEffect(() => {
    void client.invalidateQueries(
      { queryKey, exact: true },
      { cancelRefetch: false }
    );
  }, [client, queryKey, location.pathname]);

  useEffect(() => {
    if (
      !selected ||
      latestActive ||
      blocked ||
      resolvedIds.has(String(selected.invitationId)) ||
      pendingIds.has(String(selected.invitationId)) ||
      !query.hasNextPage ||
      query.isFetching ||
      query.isError
    )
      return;
    const cursor = query.data?.pages.at(-1)?.cursorId;
    const searchKey = `${selected.invitationId}:${cursor}`;
    if (cursor == null || searchedCursors.current.has(searchKey)) return;
    searchedCursors.current.add(searchKey);
    void query.fetchNextPage().then(
      (result) => {
        if (result.isError) searchedCursors.current.delete(searchKey);
      },
      () => searchedCursors.current.delete(searchKey)
    );
  }, [selected, latestActive, blocked, resolvedIds, pendingIds, query]);

  useEffect(() => {
    if (
      blocked ||
      mutations > 0 ||
      invalidIds.size === 0 ||
      items.some(
        (item) =>
          item.status === 'PENDING' &&
          !invalidIds.has(String(item.invitationId)) &&
          !resolvedIds.has(String(item.invitationId))
      ) ||
      !query.hasNextPage ||
      query.isFetching ||
      query.isError
    )
      return;
    const cursor = query.data?.pages.at(-1)?.cursorId;
    if (cursor == null) return;
    const searchKey = `invalid:${cursor}`;
    if (searchedCursors.current.has(searchKey)) return;
    searchedCursors.current.add(searchKey);
    void query.fetchNextPage();
  }, [blocked, mutations, invalidIds, items, resolvedIds, query]);

  useEffect(() => {
    if (blocked || mutations > 0 || !query.isSuccess || query.isFetching)
      return;
    const next =
      active ??
      getNextInvitationPrompt(
        items.filter((item) => !resolvedIds.has(String(item.invitationId))),
        history,
        null,
        invalidIds
      ) ??
      null;
    // Synchronize selection with the server-owned pending list, never invitation status.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next !== selected) setSelected(next);
  }, [
    selected,
    active,
    resolvedIds,
    invalidIds,
    blocked,
    history,
    items,
    mutations,
    query.isSuccess,
    query.isFetching,
  ]);

  if (!active || blocked) return null;
  const invitation = mapReceivedTravelRecordInvitation(active);
  const close = () => {
    const next = dismissInvitationBatch(items, history);
    setHistory(next);
    setSelected(null);
    try {
      sessionStorage.setItem(
        invitationPromptHistoryKey(userId),
        JSON.stringify(next)
      );
    } catch {
      /* In-memory dismissal still works if browser storage is unavailable. */
    }
  };

  return (
    <TravelRecordInvitationDialog
      key={invitation.id}
      automatic
      invitation={invitation}
      isPending={pendingIds.has(invitation.id)}
      onAccept={(item) => respond(item.id, 'ACCEPTED')}
      onDecline={(id) => respond(id, 'DECLINED')}
      onClose={close}
      onPreviewFailure={(action, id) => {
        if (action !== 'skip') return;
        setInvalidIds((previous) => new Set(previous).add(id));
        setSelected(null);
      }}
    />
  );
}

export default function GlobalTravelInvitations() {
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  if (!authenticated || userId === null) return null;
  return (
    <InvitationPrompts
      key={`${userId}:${authGeneration}`}
      userId={userId}
      authGeneration={authGeneration}
    />
  );
}
