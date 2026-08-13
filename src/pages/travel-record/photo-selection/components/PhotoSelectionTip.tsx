import tipIcon from '../assets/photo-tip-icon.svg';

const tipAreaLabel = '\uC0AC\uC9C4 \uC120\uD0DD \uC548\uB0B4';
const tipDescription =
  '\uB354 \uC0DD\uC0DD\uD55C \uAE30\uB85D\uC744 \uC704\uD574 \uB2E4\uC591\uD55C \uC0AC\uC9C4\uC744 \uCD94\uAC00\uD574 \uBCF4\uC138\uC694';
const photoTips = [
  '\uC7A5\uC18C \uD48D\uACBD',
  '\uB9DB\uC788\uB294 \uC74C\uC2DD',
  '\uC9C0\uC5ED \uBB38\uD654',
];

function PhotoSelectionTip() {
  return (
    <aside
      aria-label={tipAreaLabel}
      className="absolute top-[601px] left-6 flex h-[62px] w-[342px] items-center gap-4 rounded-xl bg-[#ffebe5] px-3.5"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#ff6f41]">
        <img src={tipIcon} alt="" aria-hidden="true" className="size-[18px]" />
      </span>
      <div className="flex min-w-0 flex-col gap-1 text-[12px] leading-none text-[#ff6f41]">
        <p>{tipDescription}</p>
        <div className="flex items-center gap-2 whitespace-nowrap">
          {photoTips.map((tip) => (
            <span key={tip}>
              <span aria-hidden="true" className="mr-1">
                &bull;
              </span>
              {tip}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default PhotoSelectionTip;
