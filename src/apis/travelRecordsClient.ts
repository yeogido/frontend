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
  travelRecordId: number,
): Promise<void> {
  await client.delete<void>(`/travel-records/${travelRecordId}`);
}
