export function hasTravelRecordVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function requireTravelRecordVersion(value: unknown): number {
  if (!hasTravelRecordVersion(value)) {
    throw new Error(
      '수정 버전을 확인할 수 없어요. 상세 화면에서 다시 수정해 주세요.'
    );
  }
  return value;
}
