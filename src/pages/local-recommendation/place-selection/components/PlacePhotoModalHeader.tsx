import { IoClose } from 'react-icons/io5';

interface PlacePhotoModalHeaderProps {
  onClose: () => void;
}

function PlacePhotoModalHeader({ onClose }: PlacePhotoModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2
          id="place-photo-modal-title"
          className="text-lg leading-6 font-semibold text-black"
        >
          장소에 <br /> 사진을 추가해 주세요
        </h2>
        <p className="text-gray-5 mt-2 text-sm leading-5">
          장소를 더 매력적으로 소개할 수 있어요!
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="사진 등록 닫기"
        className="text-gray-5 -mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full"
      >
        <IoClose aria-hidden="true" className="text-2xl" />
      </button>
    </div>
  );
}

export default PlacePhotoModalHeader;
