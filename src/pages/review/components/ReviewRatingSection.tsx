import { useGlobalScale } from '../../../hooks/useGlobalScale';

import RatingStars from './RatingStars';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 31;
const TITLE_FONT_SIZE = 16;
const TITLE_LINE_HEIGHT = 24;
const HELPER_MARGIN_TOP = 6;
const HELPER_FONT_SIZE = 12;
const HELPER_LINE_HEIGHT = 14;

interface ReviewRatingSectionProps {
  value: number | null;
  onChange: (rating: number) => void;
}

function ReviewRatingSection({ value, onChange }: ReviewRatingSectionProps) {
  const scale = useGlobalScale();

  return (
    <section
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
      aria-labelledby="rating-title"
    >
      <h2
        id="rating-title"
        className="font-semibold"
        style={{
          fontSize: TITLE_FONT_SIZE * scale,
          lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
        }}
      >
        별점을 남겨주세요
      </h2>
      <RatingStars value={value} onChange={onChange} />
      <p
        className="text-gray-3"
        style={{
          marginTop: HELPER_MARGIN_TOP * scale,
          fontSize: HELPER_FONT_SIZE * scale,
          lineHeight: `${HELPER_LINE_HEIGHT * scale}px`,
        }}
      >
        이 코스를 얼마나 만족하셨나요?
      </p>
    </section>
  );
}

export default ReviewRatingSection;
