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

function TagChip({ type, className = '' }: TagChipProps) {
  return (
    <img
      src={icons[type]}
      alt={type}
      className={`shrink-0 ${className}`}
      draggable={false}
    />
  );
}

export default TagChip;