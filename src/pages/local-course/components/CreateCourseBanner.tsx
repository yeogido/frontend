import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';

interface CreateCourseBannerProps {
  onClick: () => void;
}

function CreateCourseBanner({ onClick }: CreateCourseBannerProps) {
  return (
    <section
      className="bg-main-5 relative h-[129px] w-full max-w-[343px] overflow-hidden rounded-xl"
      aria-labelledby="local-course-banner-title"
    >
      <h2
        id="local-course-banner-title"
        className="text-pure-white absolute top-6 left-4 text-[16px] leading-[19px] font-semibold whitespace-nowrap"
      >
        내가 아는 숨은 명소를
        <br />
        다른 여행자에게 소개해보세요!
      </h2>

      <button
        type="button"
        onClick={onClick}
        className="bg-pure-white text-main-5 absolute top-[78px] left-4 inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-[12px] leading-[14px] font-semibold whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="코스 만들기"
      >
        <span className="relative h-4 w-4" aria-hidden="true">
          <img
            src={addIcon}
            alt=""
            className="absolute inset-0 h-full w-full [filter:brightness(0)_saturate(100%)_invert(57%)_sepia(87%)_saturate(2350%)_hue-rotate(333deg)_brightness(102%)_contrast(101%)]"
          />
        </span>
        코스 만들기
      </button>
    </section>
  );
}

export default CreateCourseBanner;
