interface PhotoSlotProps {
  label: string;
  previewUrl?: string;
  onClick: () => void;
}

function PhotoSlot({ label, previewUrl, onClick }: PhotoSlotProps) {
  return (
    <button
      type="button"
      aria-label={previewUrl ? `선택한 ${label}` : label}
      onClick={onClick}
      className="bg-gray-2 relative aspect-square w-full max-w-14 overflow-hidden rounded-xl"
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
  );
}

export default PhotoSlot;
