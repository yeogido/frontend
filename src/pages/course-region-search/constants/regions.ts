import {
  DEFAULT_REGION_CITY_ID,
  regionCities,
} from '../../../constants/regions';
import { regionCityImages } from '../../../constants/regionImages';
import type { CityOption } from '../types';

export const DEFAULT_CITY_ID = DEFAULT_REGION_CITY_ID;

export const cityOptions: readonly CityOption[] = regionCities.map((city) => ({
  ...city,
  imageSrc: regionCityImages[city.id],
}));
