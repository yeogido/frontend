import { IoBulb } from 'react-icons/io5';

function ReviewTipBanner() {
  return (
    <aside className="bg-main-2 text-main-5 mt-8 flex h-[62px] items-center rounded-xl px-[14px]">
      <span className="bg-main-5 flex size-7 shrink-0 items-center justify-center rounded-full text-white">
        <IoBulb aria-hidden="true" className="text-[17px]" />
      </span>
      <p className="ml-4 text-[11px] leading-[14px]">
        다른 여행자에게 도움이 되는 후기를 작성해 보세요!
        <br />
        솔직한 경험이 더 좋은 여행을 만들어줘요
      </p>
    </aside>
  );
}

export default ReviewTipBanner;
