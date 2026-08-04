import calendarIcon from '../assets/badges/calendar.svg';
import childIcon from '../assets/badges/child.svg';
import carIcon from '../assets/badges/car.svg';
import walkIcon from '../assets/badges/walk.svg';
import groupIcon from '../assets/badges/group.svg';
import soloIcon from '../assets/badges/solo.svg';
import favoriteIcon from '../assets/badges/favorite.svg';
import peopleIcon from '../assets/badges/people.svg';

export type BadgeId =
  | 'calendar'
  | 'car'
  | 'walk'
  | 'people'
  | 'solo'
  | 'child'
  | 'group'
  | 'favorite';

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
] as const;

export const badgeDefinitionMap: Record<BadgeId, BadgeDefinition> = badgeDefinitions.reduce(
  (map, badge) => {
    map[badge.id] = badge;
    return map;
  },
  {} as Record<BadgeId, BadgeDefinition>
);
