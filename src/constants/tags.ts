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
import drinkInactive from '../assets/tag-chip/inactive/drink.svg';
import gameInactive from '../assets/tag-chip/inactive/game.svg';
import musicInactive from '../assets/tag-chip/inactive/music.svg';
import sportInactive from '../assets/tag-chip/inactive/sport.svg';

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
import drinkSelected from '../assets/tag-chip/selected/drink.svg';
import gameSelected from '../assets/tag-chip/selected/game.svg';
import musicSelected from '../assets/tag-chip/selected/music.svg';
import sportSelected from '../assets/tag-chip/selected/sport.svg';

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
// card-tag-chip은 선택된(selected) 상태만 실제로 쓰여서(components/common/TagChip.tsx가
// cardTagChip.selected만 참조) drink/game/music/sport는 inactive SVG가 따로 없다.
// TagAssetState가 두 필드를 다 요구해 selected를 inactive 자리에도 그대로 넣는다.
import cardDrinkSelected from '../assets/card-tag-chip/selected/drink.svg';
import cardGameSelected from '../assets/card-tag-chip/selected/game.svg';
import cardMusicSelected from '../assets/card-tag-chip/selected/music.svg';
import cardSportSelected from '../assets/card-tag-chip/selected/sport.svg';

import type { ApiTagCode, TagDefinition, TagId } from '../types/tag.type';

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
  {
    id: 'game',
    label: '게임',
    assets: {
      tagChip: { inactive: gameInactive, selected: gameSelected },
      cardTagChip: {
        inactive: cardGameSelected,
        selected: cardGameSelected,
      },
    },
  },
  {
    id: 'music',
    label: '음악',
    assets: {
      tagChip: { inactive: musicInactive, selected: musicSelected },
      cardTagChip: {
        inactive: cardMusicSelected,
        selected: cardMusicSelected,
      },
    },
  },
  {
    id: 'drink',
    label: '술',
    assets: {
      tagChip: { inactive: drinkInactive, selected: drinkSelected },
      cardTagChip: {
        inactive: cardDrinkSelected,
        selected: cardDrinkSelected,
      },
    },
  },
  {
    id: 'sport',
    label: '스포츠',
    assets: {
      tagChip: { inactive: sportInactive, selected: sportSelected },
      cardTagChip: {
        inactive: cardSportSelected,
        selected: cardSportSelected,
      },
    },
  },
] as const satisfies readonly TagDefinition[];

export const tagDefinitionMap = tagDefinitions.reduce(
  (definitions, tag) => {
    definitions[tag.id] = tag;
    return definitions;
  },
  {} as Record<TagId, TagDefinition>
);

export const apiTagCodeMap: Record<ApiTagCode, TagId> = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter',
  NATURE: 'nature',
  MOUNTAIN: 'mountain',
  SEA: 'sea',
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  BAKERY: 'bakery',
  EXPERIENCE: 'experience',
  EVENT: 'event',
  LOCAL_ATTRACTION: 'local-attraction',
};

export const defaultCardTagIds: TagId[] = [
  'summer',
  'nature',
  'experience',
];

export const defaultApiTagCodes: ApiTagCode[] = [
  'SUMMER',
  'NATURE',
  'EXPERIENCE',
];

export const toTagId = (tagCode: ApiTagCode): TagId =>
  apiTagCodeMap[tagCode];

export const toTagIds = (tagCodes: readonly ApiTagCode[]): TagId[] =>
  tagCodes.map(toTagId);
