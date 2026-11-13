import { useRef, useState } from 'react';
import { getApiErrorMessage } from '../../../../apis/common';
import NicknameAvatar from '../../../../components/common/NicknameAvatar';
import ProfileAvatar from '../../../../components/common/ProfileAvatar';
import { useToast } from '../../../../components/toast';
import { useFriends } from '../../../../hooks/useFriends';
import { useInviteTravelRecordFriends } from '../../../../hooks/useInviteTravelRecordFriends';
import { useAuthStore } from '../../../../store/auth.store';
import { getFriendAvatarColor } from '../../../friends/utils/friendAvatarColor';
import type { TravelRecordFolder } from '../../types';

interface Props {
  folder: TravelRecordFolder;
  onSent: () => void;
  onBusyChange: (busy: boolean) => void;
}

/** 저장된 앨범에 초대만 보낸다. 실패 시 선택을 보존하며 생성 요청은 재실행하지 않는다. */
export default function TravelRecordInvitePicker({
  folder,
  onSent,
  onBusyChange,
}: Props) {
  const friendsQuery = useFriends('');
  const mutation = useInviteTravelRecordFriends(Number(folder.id));
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const { showToast } = useToast();
  const canInvite =
    folder.visibility === 'friends' && folder.permissions?.canInvite === true;
  const excluded = new Set([
    folder.owner?.userId,
    ...(folder.participants ?? []).map((member) => member.userId),
  ]);
  const friends = friendsQuery.friends.filter(
    (friend) => !excluded.has(friend.userId)
  );
  const eligibleIds = selectedIds.filter((id) =>
    friends.some((friend) => friend.userId === id)
  );
  const submit = async () => {
    if (
      submitting.current ||
      !eligibleIds.length ||
      !folder.permissions?.canInvite ||
      folder.visibility !== 'friends'
    )
      return;
    const session = useAuthStore.getState();
    submitting.current = true;
    onBusyChange(true);
    setError(null);
    try {
      await mutation.mutateAsync(eligibleIds);
      const current = useAuthStore.getState();
      if (
        session.userId !== current.userId ||
        session.authGeneration !== current.authGeneration
      )
        return;
      showToast('친구에게 초대를 보냈어요.');
      onSent();
    } catch (cause) {
      const current = useAuthStore.getState();
      if (
        session.userId === current.userId &&
        session.authGeneration === current.authGeneration
      ) {
        setError(
          getApiErrorMessage(
            cause,
            '초대를 보내지 못했어요. 폴더는 저장되어 있어요. 다시 시도해 주세요.'
          )
        );
      }
    } finally {
      submitting.current = false;
      onBusyChange(false);
    }
  };

  return (
    <div className="mt-5">
      <p className="text-sm font-medium">친구에게 공유</p>
      <ul
        aria-label="초대할 친구"
        className="scrollbar-hide -mx-5 mt-2 flex min-h-[48px] gap-3 overflow-x-auto px-5"
      >
        {friendsQuery.isPending ? (
          <li
            role="status"
            className="text-gray-4 flex min-h-[48px] w-full shrink-0 items-center text-xs"
          >
            친구 목록을 불러오는 중이에요.
          </li>
        ) : null}
        {friendsQuery.isError && !friendsQuery.friends.length ? (
          <li
            role="alert"
            className="text-gray-4 flex min-h-[48px] w-full shrink-0 flex-col items-start justify-center text-xs"
          >
            <p>친구 목록을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => void friendsQuery.refetch()}
              className="text-main-5 mt-2"
            >
              친구 목록 다시 시도
            </button>
          </li>
        ) : null}
        {!friendsQuery.isPending &&
        !friendsQuery.isError &&
        !friends.length &&
        !friendsQuery.hasNextPage ? (
          <li className="text-gray-4 flex min-h-[48px] w-full shrink-0 items-center justify-center text-xs">
            {friendsQuery.friends.length === 0
              ? '아직 등록된 친구가 없어요.'
              : '초대할 수 있는 친구가 없어요.'}
          </li>
        ) : null}
        {friends.map((friend) => (
          <li key={friend.userId} className="shrink-0">
            <button
              type="button"
              disabled={mutation.isPending || !canInvite}
              aria-label={`${friend.nickname} 선택`}
              aria-pressed={selectedIds.includes(friend.userId)}
              onClick={() => {
                setSelectedIds((ids) =>
                  ids.includes(friend.userId)
                    ? ids.filter((id) => id !== friend.userId)
                    : [...ids, friend.userId]
                );
                setError(null);
              }}
              title={friend.nickname}
              className="relative block size-12 shrink-0 rounded-full"
            >
              {friend.profileImageUrl ? (
                <ProfileAvatar src={friend.profileImageUrl} size={48} />
              ) : (
                <NicknameAvatar
                  name={friend.nickname}
                  color={getFriendAvatarColor(friend.userId)}
                  size={48}
                />
              )}
              {selectedIds.includes(friend.userId) && (
                <span
                  aria-hidden="true"
                  className="border-main-5 bg-main-5/50 pointer-events-none absolute inset-0 rounded-full border-2"
                />
              )}
            </button>
          </li>
        ))}
      </ul>
      {friendsQuery.hasNextPage ? (
        <button
          type="button"
          disabled={friendsQuery.isFetchingNextPage || mutation.isPending}
          className="text-main-5 mt-3 text-sm"
          onClick={() => void friendsQuery.fetchNextPage()}
        >
          {friendsQuery.isFetchingNextPage
            ? '친구 불러오는 중'
            : friendsQuery.isFetchNextPageError
              ? '친구 더 보기 다시 시도'
              : '친구 더 보기'}
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={!canInvite || !eligibleIds.length || mutation.isPending}
        aria-busy={mutation.isPending}
        onClick={() => void submit()}
        className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 mt-4 flex h-[43px] w-full items-center justify-center rounded-lg text-base font-semibold text-white"
      >
        {mutation.isPending ? '보내는 중' : '보내기'}
      </button>
    </div>
  );
}
