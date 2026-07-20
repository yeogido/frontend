export interface DistrictOption {
  name: string;
  subDistricts?: readonly string[];
}

export interface CityOption {
  id: string;
  name: string;
  imageSrc: string;
  districts: readonly DistrictOption[];
}

export type CourseRegionSearchTarget =
  | 'course'
  | 'local-course'
  | 'festival';
