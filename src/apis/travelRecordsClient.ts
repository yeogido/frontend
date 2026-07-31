interface TravelRecordDeleteClient {
  delete<Result>(path: string): Promise<{ data: Result }>;
}

export async function deleteTravelRecordWithClient(
  client: TravelRecordDeleteClient,
  travelRecordId: number,
): Promise<void> {
  await client.delete<void>(`/travel-records/${travelRecordId}`);
}
