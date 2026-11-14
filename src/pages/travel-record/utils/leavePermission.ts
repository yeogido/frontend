import type { TravelRecordFolder } from '../types';

export function canLeaveTravelRecord(
  folder: TravelRecordFolder | undefined,
  userId: number | null
): boolean {
  return Boolean(
    folder &&
    userId !== null &&
    /^\d+$/.test(folder.id) &&
    Number.isSafeInteger(Number(folder.id)) &&
    Number(folder.id) > 0 &&
    folder.visibility === 'friends' &&
    folder.permissions?.canLeave === true &&
    folder.owner &&
    folder.owner.userId !== userId &&
    folder.participants?.some((member) => member.userId === userId)
  );
}
