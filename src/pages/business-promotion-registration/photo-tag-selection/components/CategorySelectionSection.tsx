import { useId } from 'react';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { promotionCategoryOptions, type PromotionCategoryLabel } from '../types';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 31;
const TITLE_SIZE = 16;
const ROW_MARGIN_TOP = 12;
const ROW_GAP = 8;
const CHIP_PADDING_X = 12;
const CHIP_HEIGHT = 29;
const CHIP_FONT_SIZE = 12;

interface CategorySelectionSectionProps {
  selectedCategory: PromotionCategoryLabel | null;
  onSelect: (category: PromotionCategoryLabel) => void;
}

// admin/event-registration/photo-tag/components/CategorySelectionSection.tsx를
// 복사해 분리한 버전. 옵션을 EventCategoryId 대신
// local-business/constants의 businessCategories(맛집/카페/베이커리/체험/전시)로 바꿨다.
function CategorySelectionSection({
  selectedCategory,
  onSelect,
}: CategorySelectionSectionProps) {
  const scale = useGlobalScale();
  const titleId = useId();

  return (
    <section
      style={{ marginTop: SECTION_MARGIN_TOP * scale }}
      aria-labelledby={titleId}
    >
      <h2
        id={titleId}
        className="font-semibold"
        style={{ fontSize: TITLE_SIZE * scale }}
      >
        카테고리 등록
      </h2>

      <div
        className="flex flex-wrap"
        style={{ marginTop: ROW_MARGIN_TOP * scale, gap: ROW_GAP * scale }}
      >
        {promotionCategoryOptions.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(category)}
              className="inline-flex items-center justify-center"
              style={{ minHeight: MIN_TOUCH_TARGET }}
            >
              <span
                className={`inline-flex items-center justify-center rounded-full border font-normal transition-colors ${
                  isSelected
                    ? 'bg-main-2 border-main-5 text-main-5'
                    : 'bg-background border-gray-3 text-gray-3'
                }`}
                style={{
                  height: CHIP_HEIGHT * scale,
                  paddingLeft: CHIP_PADDING_X * scale,
                  paddingRight: CHIP_PADDING_X * scale,
                  fontSize: CHIP_FONT_SIZE * scale,
                }}
              >
                {category}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CategorySelectionSection;
