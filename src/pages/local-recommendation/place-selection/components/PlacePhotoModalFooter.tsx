interface PlacePhotoModalFooterProps {
  previewUrl: string | null;
  onConfirm: () => void;
}

function PlacePhotoModalFooter({
  previewUrl,
  onConfirm,
}: PlacePhotoModalFooterProps) {
  return (
    <button
      type="button"
      disabled={!previewUrl}
      onClick={onConfirm}
      className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 mt-6 h-[53px] w-full rounded-xl text-lg font-semibold disabled:cursor-not-allowed"
    >
      사진 추가하기
    </button>
  );
}

export default PlacePhotoModalFooter;
