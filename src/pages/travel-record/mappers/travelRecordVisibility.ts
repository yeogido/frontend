import type { TravelRecordApiVisibility } from '../../../types/travelRecord.type';
import type { TravelRecordVisibility } from '../types';

const uiVisibility = {
  PRIVATE: 'private',
  FRIENDS: 'friends',
  PUBLIC: 'public',
} satisfies Record<TravelRecordApiVisibility, TravelRecordVisibility>;

/** API의 공개범위를 화면 표현으로 변환한다. 미제공 값은 분류하지 않는다. */
export const toTravelRecordVisibility = (
  value: TravelRecordApiVisibility | undefined
) => (value === undefined ? undefined : uiVisibility[value]);
