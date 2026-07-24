import { IoStar } from 'react-icons/io5';

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
}

const RATINGS = [1, 2, 3, 4, 5] as const;

function RatingStars({ value, onChange }: RatingStarsProps) {
  return (
    <div className="mt-[15px] flex gap-[6px]" role="group" aria-label="별점 선택">
      {RATINGS.map((rating) => (
        <button
          key={rating}
          type="button"
          aria-label={`${rating}점`}
          aria-pressed={value === rating}
          onClick={() => onChange(rating)}
          className="flex size-10 items-center justify-center"
        >
          <IoStar
            aria-hidden="true"
            className={`text-[39px] ${rating <= value ? 'text-rating-star' : 'text-gray-2'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default RatingStars;
