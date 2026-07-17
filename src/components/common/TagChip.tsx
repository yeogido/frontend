import autumnSelected from '../../assets/card-tag-chip/selected/autumn.svg';
import bakerySelected from '../../assets/card-tag-chip/selected/bakery.svg';
import cafeSelected from '../../assets/card-tag-chip/selected/cafe.svg';
import eventSelected from '../../assets/card-tag-chip/selected/event.svg';
import experienceSelected from '../../assets/card-tag-chip/selected/experience.svg';
import localAttractionSelected from '../../assets/card-tag-chip/selected/local-attraction.svg';
import mountainSelected from '../../assets/card-tag-chip/selected/mountain.svg';
import natureSelected from '../../assets/card-tag-chip/selected/nature.svg';
import restaurantSelected from '../../assets/card-tag-chip/selected/restaurant.svg';
import seaSelected from '../../assets/card-tag-chip/selected/sea.svg';
import springSelected from '../../assets/card-tag-chip/selected/spring.svg';
import summerSelected from '../../assets/card-tag-chip/selected/summer.svg';
import winterSelected from '../../assets/card-tag-chip/selected/winter.svg';

export type TagType =
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'nature'
  | 'sea'
  | 'mountain'
  | 'restaurant'
  | 'cafe'
  | 'bakery'
  | 'experience'
  | 'event'
  | 'local-attraction';

interface TagChipProps {
  type: TagType;
  className?: string;
}

const icons: Record<TagType, string> = {
  spring: springSelected,
  summer: summerSelected,
  autumn: autumnSelected,
  winter: winterSelected,
  nature: natureSelected,
  sea: seaSelected,
  mountain: mountainSelected,
  restaurant: restaurantSelected,
  cafe: cafeSelected,
  bakery: bakerySelected,
  experience: experienceSelected,
  event: eventSelected,
  'local-attraction': localAttractionSelected,
};

const labels: Record<TagType, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
  nature: '자연',
  sea: '바다',
  mountain: '산',
  restaurant: '맛집',
  cafe: '카페',
  bakery: '베이커리',
  experience: '행사',
  event: '이벤트',
  'local-attraction': '지역 명소',
};

function TagChip({ type, className = '' }: TagChipProps) {
  return (
    <img
      src={icons[type]}
      alt={labels[type]}
      className={`shrink-0 ${className}`}
      draggable={false}
    />
  );
}

export default TagChip;