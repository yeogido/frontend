import { IoClose } from 'react-icons/io5';

interface PhotoSlotProps {
  label: string;
  previewUrl?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

function PhotoSlot({ label, previewUrl, onClick, onRemove }: PhotoSlotProps) {
  return (
    <div className="relative aspect-square w-full max-w-14">
      <button
        type="button"
        aria-label={previewUrl ? `선택한 ${label}` : label}
        onClick={onClick}
        disabled={Boolean(previewUrl && !onClick)}
        className="bg-gray-2 relative size-full overflow-hidden rounded-xl disabled:cursor-default"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <>
            <span className="bg-gray-3 absolute top-1/2 left-1/2 h-[1.5px] w-[18px] -translate-x-1/2 -translate-y-1/2" />
            <span className="bg-gray-3 absolute top-1/2 left-1/2 h-[18px] w-[1.5px] -translate-x-1/2 -translate-y-1/2" />
          </>
        )}
      </button>

      {previewUrl && onRemove && (
        <button
          type="button"
          aria-label="사진 삭제"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="bg-black/60 hover:bg-black/80 text-white absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full transition-colors"
        >
          <IoClose aria-hidden="true" className="text-xs" />
        </button>
      )}
    </div>
  );
}

export default PhotoSlot;
