import type { IconType } from 'react-icons';
import {
  FaDog,
  FaHeart,
  FaPeopleGroup,
  FaPeopleRoof,
  FaUser,
} from 'react-icons/fa6';

/**
 * 동행 유형 → 아이콘 매핑.
 *
 * 라벨(한글)과 enum 값(SOLO·FRIEND…)이 화면마다 섞여 들어와 둘 다 받는다.
 * CourseCard·ContentCard와 관리자 화면의 Editable* 카드가 함께 쓴다.
 */
export function getCompanionIcon(label?: string | null): IconType | null {
  if (!label) return null;

  const key = label.trim().toUpperCase();

  if (key === 'SOLO' || key === 'ALONE' || label.includes('혼자')) {
    return FaUser;
  }
  if (key === 'FRIEND' || label.includes('친구')) {
    return FaPeopleGroup;
  }
  if (key === 'COUPLE' || label.includes('연인')) {
    return FaHeart;
  }
  if (key === 'FAMILY' || label.includes('가족')) {
    return FaPeopleRoof;
  }
  if (
    key === 'PET' ||
    label.includes('반려동물') ||
    label.includes('반려견')
  ) {
    return FaDog;
  }

  return null;
}
