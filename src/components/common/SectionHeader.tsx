import vector from '../../assets/icons/vector.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';

const TITLE_SIZE = 16;
const ACTION_SIZE = 12;
const ICON_SIZE = 12;

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionClick?: () => void;
}

function SectionHeader({
  title,
  actionText,
  onActionClick,
}: SectionHeaderProps) {
  const scale = useGlobalScale();

  return (
    <div className="flex items-center justify-between">
      <h2
        className="font-semibold leading-none text-[#1C1C1C]"
        style={{ fontSize: TITLE_SIZE * scale }}
      >
        {title}
      </h2>

      {actionText && (
        <button
          type="button"
          onClick={onActionClick}
          className="flex items-center"
        >
          <span
            className="font-normal leading-none text-[#7F7F7F]"
            style={{ fontSize: ACTION_SIZE * scale }}
          >
            {actionText}
          </span>

          <img
            src={vector}
            alt=""
            aria-hidden="true"
            style={{ height: ICON_SIZE * scale, width: ICON_SIZE * scale }}
          />
        </button>
      )}
    </div>
  );
}

export default SectionHeader;