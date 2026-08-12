import type { RegionImageOption } from '../../../components/common/RegionImageCarousel';
import { REGION_IMAGE_ALL_OPTION } from '../../../components/common/RegionImageCarouselOption';
import { regionCities } from '../../../constants/regions';
import { regionCityImages } from '../../../constants/regionImages';

export const businessCategories = [
  '전체',
  '맛집',
  '카페',
  '베이커리',
  '체험',
  '전시',
] as const;

export const businessSortOptions = ['추천순', '저장순'] as const;

export const regionImageOptions: readonly RegionImageOption[] =
  [
    REGION_IMAGE_ALL_OPTION,
    ...regionCities.map((city) => ({
      id: city.id,
      name: city.name,
      imageSrc: regionCityImages[city.id],
    })),
  ];
