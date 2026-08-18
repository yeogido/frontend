import type { BadgeId } from '../../../constants/badges';

interface DetailCompanionBadge {
  readonly label: string;
  readonly icon: BadgeId;
}

const companionBadges: Record<string, DetailCompanionBadge> = {
  SOLO: { label: '혼자', icon: 'companion-solo' },
  FRIEND: { label: '친구와', icon: 'companion-friend' },
  COUPLE: { label: '연인과', icon: 'companion-couple' },
  FAMILY: { label: '가족과', icon: 'companion-family' },
  PET: { label: '반려동물과', icon: 'companion-pet' },
};

export function getDetailCompanionBadge(
  companionType: string
): DetailCompanionBadge {
  return (
    companionBadges[companionType] ?? {
      label: companionType,
      icon: 'group',
    }
  );
}
