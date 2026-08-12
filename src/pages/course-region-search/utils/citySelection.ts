import {
  REGION_IMAGE_ALL_ID,
  REGION_IMAGE_ALL_OPTION,
} from '../../../components/common/RegionImageCarouselOption.ts';
import type { CityOption } from '../types';

export const getCourseRegionCityOptions = (
  cities: readonly CityOption[]
): readonly CityOption[] => [REGION_IMAGE_ALL_OPTION, ...cities];

export const isNationwideCity = (cityId: string) =>
  cityId === REGION_IMAGE_ALL_ID;
