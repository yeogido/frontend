import { useAuthStore } from '../store/auth.store';
import { useTravelRecordSessionStore } from '../store/travelRecordSession.store';
import type { TravelRecordApiVisibility } from '../types/travelRecord.type';
import { canChangeTravelRecordVisibility } from '../pages/travel-record/utils/visibilityPermission';

/** 사진 선택과 꾸미기 단계가 같은 계정·같은 작성 흐름의 선택을 공유한다. */
export function useTravelRecordVisibilityDraft(travelRecordId?: string) {
  const userId = useAuthStore((state) => state.userId);
  const authGeneration = useAuthStore((state) => state.authGeneration);
  const draft = useTravelRecordSessionStore((state) => state.visibilityDraft);
  const editSession = useTravelRecordSessionStore((state) => state.editSession);
  const setDraft = useTravelRecordSessionStore(
    (state) => state.setVisibilityDraft
  );
  const original =
    travelRecordId && editSession?.id === travelRecordId ? editSession : null;
  const canSelect = (value: TravelRecordApiVisibility) =>
    !travelRecordId ||
    Boolean(
      canChangeTravelRecordVisibility(original?.ownerId, userId, original?.hasOtherParticipants) &&
      ['PRIVATE', 'FRIENDS', 'PUBLIC'].includes(value)
    );
  const matchingDraft =
    draft &&
    draft.travelRecordId === (travelRecordId ?? null) &&
    draft.userId === userId &&
    draft.authGeneration === authGeneration &&
    ['PRIVATE', 'FRIENDS', 'PUBLIC'].includes(draft.visibility) &&
    canSelect(draft.visibility);
  const visibility = matchingDraft
    ? draft.visibility
    : travelRecordId
      ? original?.visibility
      : 'PRIVATE';

  return {
    visibility,
    canSelect,
    setVisibility: (value: TravelRecordApiVisibility) => {
      if (canSelect(value))
        setDraft({
          travelRecordId: travelRecordId ?? null,
          userId,
          authGeneration,
          visibility: value,
        });
    },
  };
}
