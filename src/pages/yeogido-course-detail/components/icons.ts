import type { ComponentType } from 'react';
import {
  FaBusSimple,
  FaCalendarDays,
  FaCar,
  FaLocationDot,
  FaPeopleGroup,
  FaPersonWalking,
  FaRegHeart,
  FaUser,
  FaUtensils,
  FaWandMagicSparkles,
} from 'react-icons/fa6';
import { RiShare2Fill } from 'react-icons/ri';
import { MdOutlineNaturePeople } from 'react-icons/md';
import { PiSunHorizonFill } from 'react-icons/pi';

import type { CourseBadgeIcon, CourseTagIcon } from '../types/course';

type IconComponent = ComponentType<{ className?: string }>;

export const badgeIcons = {
  calendar: FaCalendarDays,
  car: FaCar,
  bus: FaBusSimple,
  people: FaPeopleGroup,
  walk: FaPersonWalking,
  solo: FaUser,
} satisfies Record<CourseBadgeIcon, IconComponent>;

export const tagIcons = {
  beach: PiSunHorizonFill,
  nature: MdOutlineNaturePeople,
  magic: FaWandMagicSparkles,
  food: FaUtensils,
} satisfies Record<CourseTagIcon, IconComponent>;

export {
  FaLocationDot as LocationIcon,
  FaRegHeart as EmptyHeartIcon,
  RiShare2Fill as ShareIcon,
};
