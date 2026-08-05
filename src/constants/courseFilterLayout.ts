export const COURSE_FILTER_CONTAINER_CLASS_NAME =
  'relative z-30 w-full overflow-visible';

export const DEFAULT_COURSE_FILTER_GRID_CLASS_NAME =
  'grid w-[342px] origin-top-left grid-cols-[69px_8px_81px_8px_81px_22px_73px] max-[389px]:[transform:scale(calc((100vw_-_48px)/342px))]';

export const EXTENDED_TRANSPORT_COURSE_FILTER_GRID_CLASS_NAME =
  'grid w-[342px] origin-top-left grid-cols-[88px_8px_81px_8px_81px_3px_73px] max-[389px]:[transform:scale(calc((100vw_-_48px)/342px))]';

export const EXTENDED_TRANSPORT_FILTER_LABEL = '대중교통';

/**
 * 좋아요 목록 필터는 코스 필터와 달리 칩이 3개이고 2번째 칩의 라벨 길이가
 * 유동적이라(지역명 / '카페 및 베이커리' 등) 고정 폭 대신 auto 트랙을 쓰고,
 * 정렬 칩만 1fr 트랙 뒤로 밀어 우측 정렬한다.
 */
export const LIKED_ITEM_FILTER_GRID_CLASS_NAME =
  'grid w-[342px] origin-top-left grid-cols-[auto_auto_1fr_auto] items-center gap-2 max-[389px]:[transform:scale(calc((100vw_-_48px)/342px))]';

const LIKED_ITEM_FILTER_COLUMN_CLASS_NAMES: Record<string, string> = {
  category: 'col-start-1',
  detail: 'col-start-2',
  sort: 'col-start-4 justify-self-end',
};

export const getLikedItemFilterColumnClassName = (filterKey: string) =>
  LIKED_ITEM_FILTER_COLUMN_CLASS_NAMES[filterKey] ?? 'col-start-1';

const COURSE_FILTER_COLUMN_CLASS_NAMES: Record<string, string> = {
  transport: 'col-start-1',
  duration: 'col-start-3',
  companion: 'col-start-5',
  sort: 'col-start-7',
};

export const getCourseFilterGridClassName = (isTransportLabelLong: boolean) =>
  isTransportLabelLong
    ? EXTENDED_TRANSPORT_COURSE_FILTER_GRID_CLASS_NAME
    : DEFAULT_COURSE_FILTER_GRID_CLASS_NAME;

export const isExtendedTransportFilterLabel = (transportLabel: string) =>
  transportLabel === EXTENDED_TRANSPORT_FILTER_LABEL;

export const getCourseFilterColumnClassName = (filterKey: string) =>
  COURSE_FILTER_COLUMN_CLASS_NAMES[filterKey] ?? 'col-start-1';
