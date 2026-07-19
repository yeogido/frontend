export const COURSE_FILTER_CONTAINER_CLASS_NAME =
  'relative z-30 h-[29px] w-full max-w-[342px] overflow-visible max-[389px]:h-[calc(29px*((100vw_-_48px)/342px))]';

export const DEFAULT_COURSE_FILTER_GRID_CLASS_NAME =
  'grid w-[342px] origin-top-left grid-cols-[69px_8px_81px_8px_81px_22px_73px] max-[389px]:[transform:scale(calc((100vw_-_48px)/342px))]';

export const EXTENDED_TRANSPORT_COURSE_FILTER_GRID_CLASS_NAME =
  'grid w-[342px] origin-top-left grid-cols-[88px_8px_81px_8px_81px_3px_73px] max-[389px]:[transform:scale(calc((100vw_-_48px)/342px))]';

export const EXTENDED_TRANSPORT_FILTER_LABEL = '대중교통';

const COURSE_FILTER_COLUMN_CLASS_NAMES: Record<string, string> = {
  transport: 'col-start-1',
  duration: 'col-start-3',
  companion: 'col-start-5',
  sort: 'col-start-7',
};

export const getCourseFilterGridClassName = (
  isTransportLabelLong: boolean
) =>
  isTransportLabelLong
    ? EXTENDED_TRANSPORT_COURSE_FILTER_GRID_CLASS_NAME
    : DEFAULT_COURSE_FILTER_GRID_CLASS_NAME;

export const isExtendedTransportFilterLabel = (transportLabel: string) =>
  transportLabel === EXTENDED_TRANSPORT_FILTER_LABEL;

export const getCourseFilterColumnClassName = (filterKey: string) =>
  COURSE_FILTER_COLUMN_CLASS_NAMES[filterKey] ?? 'col-start-1';
