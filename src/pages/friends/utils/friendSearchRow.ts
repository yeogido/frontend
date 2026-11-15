import type { FriendRelationStatus } from '../../../types/friend.type.ts';

export interface SearchRowAction {
  kind: 'send' | 'requested' | 'accept';
  label: string;
  variant: 'primary' | 'neutral' | 'accept';
  disabled: boolean;
}

/**
 * 검색 결과 행 오른쪽 버튼을 관계 상태로 정한다. RECEIVED는 수락에 requestId가
 * 필요해서 없으면 막는다. FRIEND는 결과에서 빠지므로 버튼이 없다.
 */
export function getSearchRowAction(
  relationStatus: FriendRelationStatus,
  requestId: number | null | undefined
): SearchRowAction | null {
  switch (relationStatus) {
    case 'NONE':
      return {
        kind: 'send',
        label: '친구 맺기',
        variant: 'primary',
        disabled: false,
      };
    case 'REQUESTED':
      return {
        kind: 'requested',
        label: '요청됨',
        variant: 'neutral',
        disabled: true,
      };
    case 'RECEIVED':
      return {
        kind: 'accept',
        label: '수락',
        variant: 'accept',
        disabled: requestId == null,
      };
    default:
      return null;
  }
}
