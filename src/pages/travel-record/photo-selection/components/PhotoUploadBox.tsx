import uploadIcon from '../assets/photo-upload-icon.svg';

interface PhotoUploadBoxProps {
  onUploadClick: () => void;
}

const uploadAreaLabel = '사진 업로드';
const addPhotoLabel =
  '사진을 추가해 주세요';
const uploadHelperText =
  '여기를 탭해 업로드할 수 있어요';

function PhotoUploadBox({ onUploadClick }: PhotoUploadBoxProps) {
  return (
    <section
      aria-label={uploadAreaLabel}
      className="absolute top-[237px] left-6 h-[213px] w-[342px] overflow-hidden rounded-xl border border-dashed border-[#ff6f41] bg-[#fff7f5]"
    >
      <button
        type="button"
        onClick={onUploadClick}
        className="flex size-full items-center justify-center"
      >
        <span className="flex w-[161px] flex-col items-center gap-[18px]">
          <span className="flex size-[51px] items-center justify-center rounded-full bg-[#fbd0c2]">
            <img src={uploadIcon} alt="" aria-hidden="true" className="size-8" />
          </span>
          <span className="flex flex-col items-center gap-3 text-[#1c1c1c]">
            <span className="text-center text-[14px] leading-none font-semibold">
              {addPhotoLabel}
            </span>
            <span className="text-[12px] leading-none">
              {uploadHelperText}
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}

export default PhotoUploadBox;
