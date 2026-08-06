export interface CityOption {
  id: string;
  name: string;
  imageSrc: string;
  /** 실시간 지역 API(GET /regions)와 이름으로 매칭된 실제 regionId. 아직 못 불러왔으면 undefined. */
  regionId?: number;
}

export type CourseRegionSearchTarget =
  | 'course'
  | 'local-course'
  | 'festival';
