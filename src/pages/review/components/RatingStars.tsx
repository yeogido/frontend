import { IoStar } from 'react-icons/io5';

import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const ROW_MARGIN_TOP = 15;
const ROW_GAP = 6;
const STAR_VISUAL_SIZE = 39;

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
}

const RATINGS = [1, 2, 3, 4, 5] as const;

function RatingStars({ value, onChange }: RatingStarsProps) {
  const scale = useGlobalScale();
  const starVisualSize = STAR_VISUAL_SIZE * scale;
  const starButtonSize = Math.max(starVisualSize, MIN_TOUCH_TARGET);
  const starOverlap = (starButtonSize - starVisualSize) / -2;

  return (
    <div
      className="flex"
      style={{ marginTop: ROW_MARGIN_TOP * scale, gap: ROW_GAP * scale }}
      role="group"
      aria-label="별점 선택"
    >
      {RATINGS.map((rating) => (
        <button
          key={rating}
          type="button"
          aria-label={`${rating}점`}
          aria-pressed={value === rating}
          onClick={() => onChange(rating)}
          className="flex items-center justify-center"
          style={{
            width: starButtonSize,
            height: starButtonSize,
            marginLeft: starOverlap,
            marginRight: starOverlap,
          }}
        >
          <IoStar
            aria-hidden="true"
            className={rating <= value ? 'text-rating-star' : 'text-gray-2'}
            style={{ fontSize: starVisualSize }}
          />
        </button>
      ))}
    </div>
  );
}

export default RatingStars;
