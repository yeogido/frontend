import {
  DEFAULT_REGION_CITY_ID,
  regionCities,
  type RegionCityId,
} from '../../../constants/regions';
import type { CityOption } from '../types';
import busanImage from '../assets/cities/busan.webp';
import chungbukImage from '../assets/cities/chungbuk.webp';
import chungnamImage from '../assets/cities/chungnam.webp';
import daeguImage from '../assets/cities/daegu.webp';
import daejeonImage from '../assets/cities/daejeon.webp';
import gangwonImage from '../assets/cities/gangwon.webp';
import gwangjuImage from '../assets/cities/gwangju.webp';
import gyeongbukImage from '../assets/cities/gyeongbuk.webp';
import gyeonggiImage from '../assets/cities/gyeonggi.webp';
import gyeongnamImage from '../assets/cities/gyeongnam.webp';
import incheonImage from '../assets/cities/incheon.webp';
import jejuImage from '../assets/cities/jeju.webp';
import jeonbukImage from '../assets/cities/jeonbuk.webp';
import jeonnamImage from '../assets/cities/jeonnam.webp';
import sejongImage from '../assets/cities/sejong.webp';
import seoulImage from '../assets/cities/seoul.webp';
import ulsanImage from '../assets/cities/ulsan.webp';

export const DEFAULT_CITY_ID = DEFAULT_REGION_CITY_ID;

const cityImages: Record<RegionCityId, string> = {
  seoul: seoulImage,
  busan: busanImage,
  daegu: daeguImage,
  gwangju: gwangjuImage,
  incheon: incheonImage,
  daejeon: daejeonImage,
  ulsan: ulsanImage,
  sejong: sejongImage,
  gyeonggi: gyeonggiImage,
  gangwon: gangwonImage,
  chungbuk: chungbukImage,
  chungnam: chungnamImage,
  gyeongbuk: gyeongbukImage,
  gyeongnam: gyeongnamImage,
  jeonbuk: jeonbukImage,
  jeonnam: jeonnamImage,
  jeju: jejuImage,
};

export const cityOptions: readonly CityOption[] = regionCities.map((city) => ({
  ...city,
  imageSrc: cityImages[city.id],
}));
