import animalBee from './assets/animal-bee.webp';
import animalCat from './assets/animal-cat.webp';
import animalChick from './assets/animal-chick.webp';
import animalDog from './assets/animal-dog.webp';
import animalFish from './assets/animal-fish.webp';
import animalJellyfish from './assets/animal-jellyfish.webp';
import animalSeal from './assets/animal-seal.webp';
import animalSnail from './assets/animal-snail.webp';
import animalTurtle from './assets/animal-turtle.webp';
import animalWhale from './assets/animal-whale.webp';
import foodBeer from './assets/food-beer.webp';
import foodBibimbap from './assets/food-bibimbap.webp';
import foodCake from './assets/food-cake.webp';
import foodChicken from './assets/food-chicken.webp';
import foodCoffee from './assets/food-coffee.webp';
import foodFishbread from './assets/food-fishbread.webp';
import foodKimbap from './assets/food-kimbap.webp';
import foodPork from './assets/food-pork.webp';
import foodSoju from './assets/food-soju.webp';
import foodStew from './assets/food-stew.webp';
import natureClover from './assets/nature-clover.webp';
import natureCloud from './assets/nature-cloud.webp';
import natureFire from './assets/nature-fire.webp';
import natureMountain from './assets/nature-mountain.webp';
import naturePalm from './assets/nature-palm.webp';
import natureShell from './assets/nature-shell.webp';
import natureStarfish from './assets/nature-starfish.webp';
import natureSun from './assets/nature-sun.webp';
import natureTree from './assets/nature-tree.webp';
import natureWave from './assets/nature-wave.webp';
import objectBag from './assets/object-bag.webp';
import objectBall from './assets/object-ball.webp';
import objectCamera from './assets/object-camera.webp';
import objectCar from './assets/object-car.webp';
import objectGuitar from './assets/object-guitar.webp';
import objectParasol from './assets/object-parasol.webp';
import objectShoe from './assets/object-shoe.webp';
import objectSnorkel from './assets/object-snorkel.webp';
import objectSwimsuit from './assets/object-swimsuit.webp';
import objectUmbrella from './assets/object-umbrella.webp';
import personBoys from './assets/person-boys.webp';
import personCouple from './assets/person-couple.webp';
import personEye from './assets/person-eye.webp';
import personFamily from './assets/person-family.webp';
import personFinger from './assets/person-finger.webp';
import personGirls from './assets/person-girls.webp';
import personHeart from './assets/person-heart.webp';
import personHot from './assets/person-hot.webp';
import personMouth from './assets/person-mouth.webp';
import personSmile from './assets/person-smile.webp';
import {
  type StickerCategory,
} from './stickerCatalog';

export { STICKER_CATEGORIES } from './stickerCatalog';
export type { StickerCategory } from './stickerCatalog';

export interface FolderSticker {
  id: string;
  category: StickerCategory;
  label: string;
  src: string;
}

const createStickers = (
  category: StickerCategory,
  stickers: Array<[string, string, string]>,
): FolderSticker[] =>
  stickers.map(([id, label, src]) => ({ id, label, src, category }));

export const STICKERS_BY_CATEGORY: Record<StickerCategory, FolderSticker[]> = {
  food: createStickers('food', [
    ['food-coffee', 'Coffee', foodCoffee], ['food-cake', 'Cake', foodCake],
    ['food-fishbread', 'Fish bread', foodFishbread], ['food-pork', 'Pork', foodPork],
    ['food-stew', 'Stew', foodStew], ['food-chicken', 'Chicken', foodChicken],
    ['food-kimbap', 'Kimbap', foodKimbap], ['food-bibimbap', 'Bibimbap', foodBibimbap],
    ['food-beer', 'Beer', foodBeer], ['food-soju', 'Soju', foodSoju],
  ]),
  nature: createStickers('nature', [
    ['nature-wave', 'Wave', natureWave], ['nature-palm', 'Palm tree', naturePalm],
    ['nature-starfish', 'Starfish', natureStarfish], ['nature-sun', 'Sun', natureSun],
    ['nature-shell', 'Shell', natureShell], ['nature-cloud', 'Cloud', natureCloud],
    ['nature-fire', 'Fire', natureFire], ['nature-mountain', 'Mountain', natureMountain],
    ['nature-tree', 'Tree', natureTree], ['nature-clover', 'Clover', natureClover],
  ]),
  animal: createStickers('animal', [
    ['animal-dog', 'Dog', animalDog], ['animal-cat', 'Cat', animalCat],
    ['animal-chick', 'Chick', animalChick], ['animal-bee', 'Bee', animalBee],
    ['animal-snail', 'Snail', animalSnail], ['animal-seal', 'Seal', animalSeal],
    ['animal-turtle', 'Turtle', animalTurtle], ['animal-whale', 'Whale', animalWhale],
    ['animal-fish', 'Fish', animalFish], ['animal-jellyfish', 'Jellyfish', animalJellyfish],
  ]),
  person: createStickers('person', [
    ['person-smile', 'Smile', personSmile], ['person-heart', 'Heart', personHeart],
    ['person-hot', 'Hot', personHot], ['person-eye', 'Eye', personEye],
    ['person-mouth', 'Mouth', personMouth], ['person-finger', 'Finger', personFinger],
    ['person-girls', 'Girls', personGirls], ['person-boys', 'Boys', personBoys],
    ['person-couple', 'Couple', personCouple], ['person-family', 'Family', personFamily],
  ]),
  object: createStickers('object', [
    ['object-shoe', 'Shoe', objectShoe], ['object-parasol', 'Parasol', objectParasol],
    ['object-swimsuit', 'Swimsuit', objectSwimsuit], ['object-snorkel', 'Snorkel', objectSnorkel],
    ['object-ball', 'Ball', objectBall], ['object-camera', 'Camera', objectCamera],
    ['object-umbrella', 'Umbrella', objectUmbrella], ['object-bag', 'Bag', objectBag],
    ['object-car', 'Car', objectCar], ['object-guitar', 'Guitar', objectGuitar],
  ]),
};

const stickersById = new Map(
  Object.values(STICKERS_BY_CATEGORY)
    .flat()
    .map((sticker) => [sticker.id, sticker]),
);

export const getStickerAsset = (stickerId: string) =>
  stickersById.get(stickerId) ?? null;
