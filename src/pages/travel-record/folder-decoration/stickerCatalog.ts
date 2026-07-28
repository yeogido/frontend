export const STICKER_CATEGORIES = [
  'food',
  'nature',
  'animal',
  'person',
  'object',
] as const;

export type StickerCategory = (typeof STICKER_CATEGORIES)[number];

export const STICKER_IDS = [
  'food-coffee', 'food-cake', 'food-fishbread', 'food-pork', 'food-stew',
  'food-chicken', 'food-kimbap', 'food-bibimbap', 'food-beer', 'food-soju',
  'nature-wave', 'nature-palm', 'nature-starfish', 'nature-sun', 'nature-shell',
  'nature-cloud', 'nature-fire', 'nature-mountain', 'nature-tree', 'nature-clover',
  'animal-dog', 'animal-cat', 'animal-chick', 'animal-bee', 'animal-snail',
  'animal-seal', 'animal-turtle', 'animal-whale', 'animal-fish', 'animal-jellyfish',
  'person-smile', 'person-heart', 'person-hot', 'person-eye', 'person-mouth',
  'person-finger', 'person-girls', 'person-boys', 'person-couple', 'person-family',
  'object-shoe', 'object-parasol', 'object-swimsuit', 'object-snorkel', 'object-ball',
  'object-camera', 'object-umbrella', 'object-bag', 'object-car', 'object-guitar',
] as const;

export type StickerId = (typeof STICKER_IDS)[number];

const knownStickerIds = new Set<string>(STICKER_IDS);

export const isKnownStickerId = (stickerId: string) =>
  knownStickerIds.has(stickerId);
