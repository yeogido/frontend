import type { GetCultureContentsParams } from '../../../types/content.type';
import type { FestivalViewMode } from '../constants/filters';
import {
  toFestivalDateQuery,
  type FestivalDateRange,
} from './festivalCalendar.ts';

/**
 * 진행 중인 행사 화면의 보기별 조회 조건.
 * - 그리드: 지금 진행 중인 행사만
 * - 행사 일정, 기간 선택 전: 올라와 있는 예정·진행 중 행사 전부
 * - 행사 일정, 기간 선택 후: 그 기간과 하루라도 겹치는 행사
 *
 * 달력 보기에서는 statuses를 보내지 않는다. 서버는 statuses가 없으면 날짜
 * 조건이 없을 때 예정·진행 중을, 있을 때 모든 상태를 돌려주는데 이게 정확히
 * 원하는 결과다. 또 axios는 배열을 statuses[]=A&statuses[]=B로 보내는데
 * 서버가 이 형식에서 값 하나만 읽어서, 상태 두 개를 직접 보내면 결과가 빠진다.
 */
export const getFestivalListQuery = (
  viewMode: FestivalViewMode,
  dateRange: FestivalDateRange | null
): Pick<GetCultureContentsParams, 'statuses' | 'startDate' | 'endDate'> => {
  if (viewMode === 'grid') {
    return { statuses: ['ONGOING'] };
  }

  return toFestivalDateQuery(dateRange);
};
