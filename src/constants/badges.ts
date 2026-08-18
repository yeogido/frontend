import calendarIcon from '../assets/badges/calendar.svg';
import childIcon from '../assets/badges/child.svg';
import carIcon from '../assets/badges/car.svg';
import walkIcon from '../assets/badges/walk.svg';
import groupIcon from '../assets/badges/group.svg';
import soloIcon from '../assets/badges/solo.svg';
import favoriteIcon from '../assets/badges/favorite.svg';
import peopleIcon from '../assets/badges/people.svg';
import companionSoloIcon from '../assets/badges/companion-solo.svg';
import companionFriendIcon from '../assets/badges/companion-friend.svg';
import companionCoupleIcon from '../assets/badges/companion-couple.svg';
import companionFamilyIcon from '../assets/badges/companion-family.svg';
import companionPetIcon from '../assets/badges/companion-pet.svg';

export type BadgeId =
  | 'calendar'
  | 'car'
  | 'walk'
  | 'people'
  | 'solo'
  | 'child'
  | 'group'
  | 'favorite'
  | 'companion-solo'
  | 'companion-friend'
  | 'companion-couple'
  | 'companion-family'
  | 'companion-pet';

export interface BadgeDefinition {
  id: BadgeId;
  icon: string;
}

export const badgeDefinitions: readonly BadgeDefinition[] = [
  { id: 'calendar', icon: calendarIcon },
  { id: 'car', icon: carIcon },
  { id: 'walk', icon: walkIcon },
  { id: 'people', icon: peopleIcon },
  { id: 'solo', icon: soloIcon },
  { id: 'child', icon: childIcon },
  { id: 'group', icon: groupIcon },
  { id: 'favorite', icon: favoriteIcon },
  { id: 'companion-solo', icon: companionSoloIcon },
  { id: 'companion-friend', icon: companionFriendIcon },
  { id: 'companion-couple', icon: companionCoupleIcon },
  { id: 'companion-family', icon: companionFamilyIcon },
  { id: 'companion-pet', icon: companionPetIcon },
] as const;

export const badgeDefinitionMap: Record<BadgeId, BadgeDefinition> = badgeDefinitions.reduce(
  (map, badge) => {
    map[badge.id] = badge;
    return map;
  },
  {} as Record<BadgeId, BadgeDefinition>
);
