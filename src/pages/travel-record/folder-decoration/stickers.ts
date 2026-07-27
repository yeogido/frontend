import animalBee from './assets/animal-bee.png';
import animalCat from './assets/animal-cat.png';
import animalChick from './assets/animal-chick.png';
import animalDog from './assets/animal-dog.png';
import animalFish from './assets/animal-fish.png';
import animalJellyfish from './assets/animal-jellyfish.png';
import animalSeal from './assets/animal-seal.png';
import animalSnail from './assets/animal-snail.png';
import animalTurtle from './assets/animal-turtle.png';
import animalWhale from './assets/animal-whale.png';
import foodBeer from './assets/food-beer.png';
import foodBibimbap from './assets/food-bibimbap.png';
import foodCake from './assets/food-cake.png';
import foodChicken from './assets/food-chicken.png';
import foodCoffee from './assets/food-coffee.png';
import foodFishbread from './assets/food-fishbread.png';
import foodKimbap from './assets/food-kimbap.png';
import foodPork from './assets/food-pork.png';
import foodSoju from './assets/food-soju.png';
import foodStew from './assets/food-stew.png';
import natureClover from './assets/nature-clover.png';
import natureCloud from './assets/nature-cloud.png';
import natureFire from './assets/nature-fire.png';
import natureMountain from './assets/nature-mountain.png';
import naturePalm from './assets/nature-palm.png';
import natureShell from './assets/nature-shell.png';
import natureStarfish from './assets/nature-starfish.png';
import natureSun from './assets/nature-sun.png';
import natureTree from './assets/nature-tree.png';
import natureWave from './assets/nature-wave.png';
import objectBag from './assets/object-bag.png';
import objectBall from './assets/object-ball.png';
import objectCamera from './assets/object-camera.png';
import objectCar from './assets/object-car.png';
import objectGuitar from './assets/object-guitar.png';
import objectParasol from './assets/object-parasol.png';
import objectShoe from './assets/object-shoe.png';
import objectSnorkel from './assets/object-snorkel.png';
import objectSwimsuit from './assets/object-swimsuit.png';
import objectUmbrella from './assets/object-umbrella.png';
import personBoys from './assets/person-boys.png';
import personCouple from './assets/person-couple.png';
import personEye from './assets/person-eye.png';
import personFamily from './assets/person-family.png';
import personFinger from './assets/person-finger.png';
import personGirls from './assets/person-girls.png';
import personHeart from './assets/person-heart.png';
import personHot from './assets/person-hot.png';
import personMouth from './assets/person-mouth.png';
import personSmile from './assets/person-smile.png';
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
