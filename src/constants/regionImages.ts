import type { RegionCityId } from './regions';
import busanImage from '../assets/images/regions/busan.webp';
import chungbukImage from '../assets/images/regions/chungbuk.webp';
import chungnamImage from '../assets/images/regions/chungnam.webp';
import daeguImage from '../assets/images/regions/daegu.webp';
import daejeonImage from '../assets/images/regions/daejeon.webp';
import gangwonImage from '../assets/images/regions/gangwon.webp';
import gwangjuImage from '../assets/images/regions/gwangju.webp';
import gyeongbukImage from '../assets/images/regions/gyeongbuk.webp';
import gyeonggiImage from '../assets/images/regions/gyeonggi.webp';
import gyeongnamImage from '../assets/images/regions/gyeongnam.webp';
import incheonImage from '../assets/images/regions/incheon.webp';
import jejuImage from '../assets/images/regions/jeju.webp';
import jeonbukImage from '../assets/images/regions/jeonbuk.webp';
import jeonnamImage from '../assets/images/regions/jeonnam.webp';
import sejongImage from '../assets/images/regions/sejong.webp';
import seoulImage from '../assets/images/regions/seoul.webp';
import ulsanImage from '../assets/images/regions/ulsan.webp';

export const regionCityImages: Record<RegionCityId, string> = {
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
