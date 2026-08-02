/**
 * 프론트 스티커 id <-> 백엔드 stickerId(number) 매핑.
 *
 * 백엔드에 스티커 카탈로그 API가 없어 임의로 번호를 고정한다. 값은
 * stickerCatalog.ts의 STICKER_IDS 배열 순서를 그대로 옮긴 것이지만,
 * 여기서는 리터럴로 고정해 STICKER_IDS 순서가 나중에 바뀌어도
 * 이미 저장된 기록의 스티커 번호가 흔들리지 않도록 한다.
 */
export const FRONTEND_STICKER_ID_TO_BACKEND_ID: Record<string, number> = {
  'food-coffee': 1,
  'food-cake': 2,
  'food-fishbread': 3,
  'food-pork': 4,
  'food-stew': 5,
  'food-chicken': 6,
  'food-kimbap': 7,
  'food-bibimbap': 8,
  'food-beer': 9,
  'food-soju': 10,
  'nature-wave': 11,
  'nature-palm': 12,
  'nature-starfish': 13,
  'nature-sun': 14,
  'nature-shell': 15,
  'nature-cloud': 16,
  'nature-fire': 17,
  'nature-mountain': 18,
  'nature-tree': 19,
  'nature-clover': 20,
  'animal-dog': 21,
  'animal-cat': 22,
  'animal-chick': 23,
  'animal-bee': 24,
  'animal-snail': 25,
  'animal-seal': 26,
  'animal-turtle': 27,
  'animal-whale': 28,
  'animal-fish': 29,
  'animal-jellyfish': 30,
  'person-smile': 31,
  'person-heart': 32,
  'person-hot': 33,
  'person-eye': 34,
  'person-mouth': 35,
  'person-finger': 36,
  'person-girls': 37,
  'person-boys': 38,
  'person-couple': 39,
  'person-family': 40,
  'object-shoe': 41,
  'object-parasol': 42,
  'object-swimsuit': 43,
  'object-snorkel': 44,
  'object-ball': 45,
  'object-camera': 46,
  'object-umbrella': 47,
  'object-bag': 48,
  'object-car': 49,
  'object-guitar': 50,
};

export const BACKEND_STICKER_ID_TO_FRONTEND_ID: Record<number, string> =
  Object.fromEntries(
    Object.entries(FRONTEND_STICKER_ID_TO_BACKEND_ID).map(
      ([stickerId, backendStickerId]) => [backendStickerId, stickerId],
    ),
  );
