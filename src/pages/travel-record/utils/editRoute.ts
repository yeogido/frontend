export const getTravelRecordEditRoute = (
  travelRecordId: string,
  step?: 'date' | 'photos' | 'decorate',
) => {
  const baseRoute = `/travel-record/${travelRecordId}/edit`;

  return step ? `${baseRoute}/${step}` : baseRoute;
};
