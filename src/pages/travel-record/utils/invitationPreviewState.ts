import { getInvitationPreviewFailureAction } from './invitationPreviewFailure.ts';

export function shouldHandleInvitationPreviewFailure(
  hasData: boolean,
  error: unknown
): boolean {
  if (!hasData) return true;
  return getInvitationPreviewFailureAction(true, error) === 'skip';
}
