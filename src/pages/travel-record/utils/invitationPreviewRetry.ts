export function shouldRetryInvitationPreview(
  failureCount: number,
  error: unknown
): boolean {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? error.status
      : undefined;
  return (
    !(typeof status === 'number' && status >= 400 && status < 500) &&
    failureCount < 1
  );
}
