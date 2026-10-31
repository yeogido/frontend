import type { TravelRecordMember } from '../pages/travel-record/detail/components/TravelRecordMembers';

/** 친구 기능 연동 전 공유 모달의 선택 상태를 확인하기 위한 임시 목록. */
export const mockTravelRecordShareFriends = [
  { id: 'preview-friend-1', name: '서희연', color: 'green' },
  { id: 'preview-friend-2', name: '이준혁', color: 'blue' },
  { id: 'preview-friend-3', name: '김민지', color: 'purple' },
  { id: 'preview-friend-4', name: '박서연', color: 'purple' },
  { id: 'preview-friend-5', name: '정수빈', color: 'orange' },
  { id: 'preview-friend-6', name: '최지우', color: 'blue' },
] as const satisfies readonly TravelRecordMember[];
