import type { TravelRecordMember } from '../pages/travel-record/detail/components/TravelRecordMembers';

/** 공유 UI 확인용 임시 데이터. 참여자 API 연동 시 서버 데이터로 교체한다. */
export const mockTravelRecordMembers = [
  { id: 'preview-member-1', name: '희연', color: 'orange' },
  { id: 'preview-member-2', name: '희연', color: 'blue' },
  { id: 'preview-member-3', name: '희연', color: 'green' },
] as const satisfies readonly TravelRecordMember[];
