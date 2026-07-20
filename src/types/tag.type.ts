export type TagId =
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'nature'
  | 'mountain'
  | 'sea'
  | 'restaurant'
  | 'cafe'
  | 'bakery'
  | 'experience'
  | 'event'
  | 'local-attraction';

export type ApiTagCode =
  | 'SPRING'
  | 'SUMMER'
  | 'AUTUMN'
  | 'WINTER'
  | 'NATURE'
  | 'MOUNTAIN'
  | 'SEA'
  | 'RESTAURANT'
  | 'CAFE'
  | 'BAKERY'
  | 'EXPERIENCE'
  | 'EVENT'
  | 'LOCAL_ATTRACTION';

export interface TagAssetState {
  inactive: string;
  selected: string;
}

export interface TagDefinition {
  id: TagId;
  label: string;
  assets: {
    tagChip: TagAssetState;
    cardTagChip: TagAssetState;
  };
}
