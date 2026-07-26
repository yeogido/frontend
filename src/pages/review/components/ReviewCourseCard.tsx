import {
  IoCalendarOutline,
  IoImageOutline,
  IoLocationSharp,
  IoPerson,
} from 'react-icons/io5';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { scaleValue } from '../../../utils/responsiveLayout';

// Figma 390 디자인 기준 리터럴 px
const CARD_MARGIN_TOP = 29;
const CARD_MIN_HEIGHT = 100;
const CARD_PADDING = 12;
const CARD_RADIUS = 12;
const THUMBNAIL_WIDTH = 103;
const THUMBNAIL_HEIGHT = 76;
const THUMBNAIL_RADIUS = 8;
const NO_IMAGE_ICON_SIZE = 20;
const NO_IMAGE_TEXT_SIZE = 10;
const CONTENT_MARGIN_LEFT = 12;
const TITLE_FONT_SIZE = 15;
const TITLE_LINE_HEIGHT = 20;
const META_MARGIN_TOP = 12;
const META_FONT_SIZE = 11;
const META_LINE_HEIGHT = 16;
const META_ICON_SIZE = 13;

export interface ReviewCourseCardProps {
  title?: string;
  image?: string;
  thumbnailUrl?: string;
  duration?: string;
  courseType?: string;
  companion?: string;
}

function ReviewCourseCard({
  title = '강릉 혼자 여행 코스',
  image,
  thumbnailUrl,
  duration = '2박 3일',
  courseType = '뚜벅이 코스',
  companion = '혼자',
}: ReviewCourseCardProps) {
  const thumbnail = image || thumbnailUrl;
  const scale = useGlobalScale();

  return (
    <section
      aria-label="리뷰할 코스"
      className="bg-background flex items-center"
      style={{
        marginTop: CARD_MARGIN_TOP * scale,
        minHeight: CARD_MIN_HEIGHT * scale,
        borderRadius: CARD_RADIUS * scale,
        padding: CARD_PADDING * scale,
      }}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="shrink-0 object-cover"
          style={{
            width: THUMBNAIL_WIDTH * scale,
            height: THUMBNAIL_HEIGHT * scale,
            borderRadius: THUMBNAIL_RADIUS * scale,
          }}
        />
      ) : (
        <div
          className="bg-gray-2 text-gray-4 flex shrink-0 flex-col items-center justify-center gap-1"
          style={{
            width: THUMBNAIL_WIDTH * scale,
            height: THUMBNAIL_HEIGHT * scale,
            borderRadius: THUMBNAIL_RADIUS * scale,
          }}
        >
          <IoImageOutline
            aria-hidden="true"
            style={{ fontSize: NO_IMAGE_ICON_SIZE * scale }}
          />
          <span
            className="font-medium"
            style={{ fontSize: scaleValue(NO_IMAGE_TEXT_SIZE, scale, 10) }}
          >
            이미지 없음
          </span>
        </div>
      )}
      <div
        className="min-w-0 flex-1"
        style={{ marginLeft: CONTENT_MARGIN_LEFT * scale }}
      >
        <h2
          className="truncate font-semibold tracking-[-0.02em]"
          style={{
            fontSize: scaleValue(TITLE_FONT_SIZE, scale, 14),
            lineHeight: `${scaleValue(TITLE_LINE_HEIGHT, scale, 18)}px`,
          }}
        >
          {title}
        </h2>
        <div
          className="text-gray-4 flex flex-wrap items-center"
          style={{
            marginTop: META_MARGIN_TOP * scale,
            columnGap: 9 * scale,
            rowGap: 4 * scale,
            fontSize: scaleValue(META_FONT_SIZE, scale, 11),
            lineHeight: `${scaleValue(META_LINE_HEIGHT, scale, 14)}px`,
          }}
        >
          {duration && (
            <span
              className="flex items-center whitespace-nowrap"
              style={{ gap: 3 * scale }}
            >
              <IoCalendarOutline
                aria-hidden="true"
                style={{ fontSize: META_ICON_SIZE * scale }}
              />
              {duration}
            </span>
          )}
          {courseType && (
            <span
              className="flex items-center whitespace-nowrap"
              style={{ gap: 2 * scale }}
            >
              <IoLocationSharp
                aria-hidden="true"
                style={{ fontSize: META_ICON_SIZE * scale }}
              />
              {courseType}
            </span>
          )}
          {companion && (
            <span
              className="flex items-center whitespace-nowrap"
              style={{ gap: 3 * scale }}
            >
              <IoPerson aria-hidden="true" style={{ fontSize: 12 * scale }} />
              {companion}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export default ReviewCourseCard;
