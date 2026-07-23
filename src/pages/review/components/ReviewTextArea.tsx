import type { ChangeEvent } from 'react';

interface ReviewTextAreaProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
}

function ReviewTextArea({ value, onChange, maxLength = 300 }: ReviewTextAreaProps) {
  return (
    <section className="mt-[31px]" aria-labelledby="review-title">
      <h2 id="review-title" className="text-base leading-6 font-semibold">
        총평을 남겨주세요
      </h2>
      <textarea
        value={value}
        maxLength={maxLength}
        onChange={onChange}
        aria-label="코스 총평"
        placeholder={'이 코스는 어땠나요?\n좋았던 점, 아쉬웠던 점을 자유롭게 작성해 주세요.'}
        className="border-gray-2 mt-[9px] h-[109px] w-full resize-none rounded-xl border bg-white px-3 py-3 text-xs leading-4 outline-none placeholder:text-gray-4 focus:border-main-5"
      />
    </section>
  );
}

export default ReviewTextArea;
