import autumnInactive from '../assets/tag-chip/inactive/autumn.svg';
import bakeryInactive from '../assets/tag-chip/inactive/bakery.svg';
import cafeInactive from '../assets/tag-chip/inactive/cafe.svg';
import eventInactive from '../assets/tag-chip/inactive/event.svg';
import experienceInactive from '../assets/tag-chip/inactive/experience.svg';
import localAttractionInactive from '../assets/tag-chip/inactive/local-attraction.svg';
import mountainInactive from '../assets/tag-chip/inactive/mountain.svg';
import natureInactive from '../assets/tag-chip/inactive/nature.svg';
import restaurantInactive from '../assets/tag-chip/inactive/restaurant.svg';
import seaInactive from '../assets/tag-chip/inactive/sea.svg';
import springInactive from '../assets/tag-chip/inactive/spring.svg';
import summerInactive from '../assets/tag-chip/inactive/summer.svg';
import winterInactive from '../assets/tag-chip/inactive/winter.svg';

import autumnSelected from '../assets/tag-chip/selected/autumn.svg';
import bakerySelected from '../assets/tag-chip/selected/bakery.svg';
import cafeSelected from '../assets/tag-chip/selected/cafe.svg';
import eventSelected from '../assets/tag-chip/selected/event.svg';
import experienceSelected from '../assets/tag-chip/selected/experience.svg';
import localAttractionSelected from '../assets/tag-chip/selected/local-attraction.svg';
import mountainSelected from '../assets/tag-chip/selected/mountain.svg';
import natureSelected from '../assets/tag-chip/selected/nature.svg';
import restaurantSelected from '../assets/tag-chip/selected/restaurant.svg';
import seaSelected from '../assets/tag-chip/selected/sea.svg';
import springSelected from '../assets/tag-chip/selected/spring.svg';
import summerSelected from '../assets/tag-chip/selected/summer.svg';
import winterSelected from '../assets/tag-chip/selected/winter.svg';

import cardAutumnInactive from '../assets/card-tag-chip/inactive/autumn.svg';
import cardBakeryInactive from '../assets/card-tag-chip/inactive/bakery.svg';
import cardCafeInactive from '../assets/card-tag-chip/inactive/cafe.svg';
import cardEventInactive from '../assets/card-tag-chip/inactive/event.svg';
import cardExperienceInactive from '../assets/card-tag-chip/inactive/experience.svg';
import cardLocalAttractionInactive from '../assets/card-tag-chip/inactive/local-attraction.svg';
import cardMountainInactive from '../assets/card-tag-chip/inactive/mountain.svg';
import cardNatureInactive from '../assets/card-tag-chip/inactive/nature.svg';
import cardRestaurantInactive from '../assets/card-tag-chip/inactive/restaurant.svg';
import cardSeaInactive from '../assets/card-tag-chip/inactive/sea.svg';
import cardSpringInactive from '../assets/card-tag-chip/inactive/spring.svg';
import cardSummerInactive from '../assets/card-tag-chip/inactive/summer.svg';
import cardWinterInactive from '../assets/card-tag-chip/inactive/winter.svg';

import cardAutumnSelected from '../assets/card-tag-chip/selected/autumn.svg';
import cardBakerySelected from '../assets/card-tag-chip/selected/bakery.svg';
import cardCafeSelected from '../assets/card-tag-chip/selected/cafe.svg';
import cardEventSelected from '../assets/card-tag-chip/selected/event.svg';
import cardExperienceSelected from '../assets/card-tag-chip/selected/experience.svg';
import cardLocalAttractionSelected from '../assets/card-tag-chip/selected/local-attraction.svg';
import cardMountainSelected from '../assets/card-tag-chip/selected/mountain.svg';
import cardNatureSelected from '../assets/card-tag-chip/selected/nature.svg';
import cardRestaurantSelected from '../assets/card-tag-chip/selected/restaurant.svg';
import cardSeaSelected from '../assets/card-tag-chip/selected/sea.svg';
import cardSpringSelected from '../assets/card-tag-chip/selected/spring.svg';
import cardSummerSelected from '../assets/card-tag-chip/selected/summer.svg';
import cardWinterSelected from '../assets/card-tag-chip/selected/winter.svg';

import type { TagDefinition } from '../types/tag.type';

export const MAX_SELECTED_TAGS = 5;

export const tagDefinitions = [
  {
    id: 'spring',
    label: '봄',
    assets: {
      tagChip: { inactive: springInactive, selected: springSelected },
      cardTagChip: {
        inactive: cardSpringInactive,
        selected: cardSpringSelected,
      },
    },
  },
  {
    id: 'summer',
    label: '여름',
    assets: {
      tagChip: { inactive: summerInactive, selected: summerSelected },
      cardTagChip: {
        inactive: cardSummerInactive,
        selected: cardSummerSelected,
      },
    },
  },
  {
    id: 'autumn',
    label: '가을',
    assets: {
      tagChip: { inactive: autumnInactive, selected: autumnSelected },
      cardTagChip: {
        inactive: cardAutumnInactive,
        selected: cardAutumnSelected,
      },
    },
  },
  {
    id: 'winter',
    label: '겨울',
    assets: {
      tagChip: { inactive: winterInactive, selected: winterSelected },
      cardTagChip: {
        inactive: cardWinterInactive,
        selected: cardWinterSelected,
      },
    },
  },
  {
    id: 'nature',
    label: '자연',
    assets: {
      tagChip: { inactive: natureInactive, selected: natureSelected },
      cardTagChip: {
        inactive: cardNatureInactive,
        selected: cardNatureSelected,
      },
    },
  },
  {
    id: 'mountain',
    label: '산',
    assets: {
      tagChip: { inactive: mountainInactive, selected: mountainSelected },
      cardTagChip: {
        inactive: cardMountainInactive,
        selected: cardMountainSelected,
      },
    },
  },
  {
    id: 'sea',
    label: '바다',
    assets: {
      tagChip: { inactive: seaInactive, selected: seaSelected },
      cardTagChip: {
        inactive: cardSeaInactive,
        selected: cardSeaSelected,
      },
    },
  },
  {
    id: 'restaurant',
    label: '맛집',
    assets: {
      tagChip: { inactive: restaurantInactive, selected: restaurantSelected },
      cardTagChip: {
        inactive: cardRestaurantInactive,
        selected: cardRestaurantSelected,
      },
    },
  },
  {
    id: 'cafe',
    label: '카페',
    assets: {
      tagChip: { inactive: cafeInactive, selected: cafeSelected },
      cardTagChip: {
        inactive: cardCafeInactive,
        selected: cardCafeSelected,
      },
    },
  },
  {
    id: 'bakery',
    label: '베이커리',
    assets: {
      tagChip: { inactive: bakeryInactive, selected: bakerySelected },
      cardTagChip: {
        inactive: cardBakeryInactive,
        selected: cardBakerySelected,
      },
    },
  },
  {
    id: 'experience',
    label: '체험',
    assets: {
      tagChip: { inactive: experienceInactive, selected: experienceSelected },
      cardTagChip: {
        inactive: cardExperienceInactive,
        selected: cardExperienceSelected,
      },
    },
  },
  {
    id: 'event',
    label: '행사',
    assets: {
      tagChip: { inactive: eventInactive, selected: eventSelected },
      cardTagChip: {
        inactive: cardEventInactive,
        selected: cardEventSelected,
      },
    },
  },
  {
    id: 'local-attraction',
    label: '지역명소',
    assets: {
      tagChip: {
        inactive: localAttractionInactive,
        selected: localAttractionSelected,
      },
      cardTagChip: {
        inactive: cardLocalAttractionInactive,
        selected: cardLocalAttractionSelected,
      },
    },
  },
] as const satisfies readonly TagDefinition[];
