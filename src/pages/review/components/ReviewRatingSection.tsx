import RatingStars from './RatingStars';

interface ReviewRatingSectionProps {
  value: number;
  onChange: (rating: number) => void;
}

function ReviewRatingSection({ value, onChange }: ReviewRatingSectionProps) {
  return (
    <section className="mt-[31px]" aria-labelledby="rating-title">
      <h2 id="rating-title" className="text-base leading-6 font-semibold">
        별점을 남겨주세요
      </h2>
      <RatingStars value={value} onChange={onChange} />
      <p className="text-gray-3 mt-[3px] text-[11px] leading-4">
        이 코스를 얼마나 만족하셨나요?
      </p>
    </section>
  );
}

export default ReviewRatingSection;
