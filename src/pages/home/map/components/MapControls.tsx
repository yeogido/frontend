interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  return (
    <div
      className="
        absolute
        bottom-4
        right-4
        flex
        items-center
        gap-[10px]
        rounded
        border
        border-[#D9D9D9]
        bg-white
        px-[5px]
        py-1
      "
    >
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-6 w-6 items-center justify-center text-2xl"
      >
        −
      </button>

      <span className="w-10 text-center text-base font-medium">
        {zoom.toFixed(1)}x
      </span>

      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-6 w-6 items-center justify-center text-2xl"
      >
        +
      </button>
    </div>
  );
}

export default MapControls;