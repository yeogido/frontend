export function canChangeTravelRecordVisibility(
  ownerId: number | undefined,
  userId: number | null,
  hasOtherParticipants: boolean | undefined
): boolean {
  return userId !== null && ownerId === userId && hasOtherParticipants === false;
}
