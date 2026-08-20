import type { IconType } from 'react-icons';
import {
  MdDiversity3,
  MdFace,
  MdFavorite,
  MdGroup,
  MdPets,
} from 'react-icons/md';

/**
 * 동행 유형 → 아이콘 매핑.
 *
 * 라벨(한글)과 enum 값(SOLO·FRIEND…)이 화면마다 섞여 들어와 둘 다 받는다.
 * CourseCard·ContentCard와 관리자 화면의 Editable* 카드가 함께 쓴다.
 * CompanionSelector.tsx(코스 등록의 동행유형 선택 화면)와 같은 아이콘 —
 * 피그마 노드(541:6237)의 material-symbols:face, group-rounded,
 * favorite-rounded, diversity-3-rounded, pets에 1:1로 맞춘 것과 동일하다.
 */
export function getCompanionIcon(label?: string | null): IconType | null {
  if (!label) return null;

  const key = label.trim().toUpperCase();

  if (key === 'SOLO' || label.includes('혼자')) {
    return MdFace;
  }
  if (key === 'FRIEND' || label.includes('친구')) {
    return MdGroup;
  }
  if (key === 'COUPLE' || label.includes('연인')) {
    return MdFavorite;
  }
  if (key === 'FAMILY' || label.includes('가족')) {
    return MdDiversity3;
  }
  if (
    key === 'PET' ||
    label.includes('반려동물') ||
    label.includes('반려견')
  ) {
    return MdPets;
  }

  return null;
}
