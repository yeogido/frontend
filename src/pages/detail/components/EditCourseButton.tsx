import { FaPen as EditIcon } from 'react-icons/fa6';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

// FavoriteButton과 같은 자리(히어로 우측 상단)에 들어가는 버튼이라 크기를
// 맞춘다.
const BUTTON_SIZE = 44;
const ICON_SIZE = 22;

export interface EditCourseButtonProps {
  label: string;
  onClick: () => void;
}

export function EditCourseButton({ label, onClick }: EditCourseButtonProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      aria-label={`${label} 수정`}
      onClick={onClick}
      className="flex items-center justify-center text-white drop-shadow-sm"
      style={{
        height: BUTTON_SIZE * scale,
        width: BUTTON_SIZE * scale,
      }}
    >
      <EditIcon
        style={{ height: ICON_SIZE * scale, width: ICON_SIZE * scale }}
      />
    </button>
  );
}

export default EditCourseButton;
