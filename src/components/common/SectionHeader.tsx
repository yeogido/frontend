import vector from '../../assets/icons/vector.svg';

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
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[16px] font-semibold leading-none text-[#1C1C1C]">
        {title}
      </h2>

      {actionText && (
        <button
          type="button"
          onClick={onActionClick}
          className="flex items-center"
        >
          <span className="text-[12px] font-normal leading-none text-[#7F7F7F]">
            {actionText}
          </span>

          <img
            src={vector}
            alt=""
            aria-hidden="true"
            className="h-3 w-3"
          />
        </button>
      )}
    </div>
  );
}

export default SectionHeader;