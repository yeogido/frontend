// Kept separate from travelRecords.api.ts: apiClient.ts reads
// import.meta.env at module load time, which the plain Node test
// runner (npm test) can't provide. Importing anything from
// travelRecords.api.ts pulls in that whole chain via ./common, so this
// file stays free of that import to keep the delete call unit-testable.
interface TravelRecordDeleteClient {
  delete<Result>(path: string): Promise<{ data: Result }>;
}

export async function deleteTravelRecordWithClient(
  client: TravelRecordDeleteClient,
  travelRecordId: number
): Promise<void> {
  await client.delete<void>(`/travel-records/${travelRecordId}`);
}

/** 본인의 참여 관계만 제거한다. 앨범 전체 삭제와 경로를 분리한다. */
export async function leaveTravelRecordWithClient(
  client: TravelRecordDeleteClient,
  travelRecordId: number
): Promise<void> {
  if (!Number.isSafeInteger(travelRecordId) || travelRecordId <= 0) {
    throw new Error('유효하지 않은 여행 기록입니다.');
  }
  await client.delete<void>(`/travel-records/${travelRecordId}/members/me`);
}
