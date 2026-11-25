export function getInvitationPreviewFailureAction(
  automatic: boolean,
  error: unknown
): 'skip' | 'reset' | 'wait' {
  if (!automatic) return 'reset';
  if (typeof error === 'object' && error !== null) {
    if (
      ('status' in error && error.status === 404) ||
      ('code' in error && error.code === 'TRAVEL_RECORD4042')
    )
      return 'skip';
  }
  return 'wait';
}
