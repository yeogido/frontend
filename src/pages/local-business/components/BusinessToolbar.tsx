import { useLayoutEffect, useRef, useState } from 'react';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

import { businessCategories } from '../constants';
import type { BusinessCategory, BusinessSort, BusinessViewMode } from '../types';
import BusinessCategoryChips from './BusinessCategoryChips';
import BusinessSortDropdown from './BusinessSortDropdown';
import BusinessViewToggle from './BusinessViewToggle';

const TOOLBAR_MARGIN_TOP = 12;
const TOOLBAR_HEIGHT = 29;
const TOOLBAR_GAP = 8;

interface BusinessToolbarProps {
  selectedCategory: BusinessCategory;
  sortBy: BusinessSort;
  viewMode: BusinessViewMode;
  onSelectCategory: (category: BusinessCategory) => void;
  onSortChange: (value: BusinessSort) => void;
  onToggleView: () => void;
}

/**
 * 정렬 드롭다운·보기 방식 토글은 이 줄에 고정, 카테고리 칩만 가로
 * 스크롤된다(Figma 주석은 전체 줄 스크롤로 남아 있으나, 실제로는 최신
 * 반영이 안 된 상태라 이 동작으로 진행하기로 확정함).
 *
 * 두 정적 컴포넌트(BusinessSortDropdown/BusinessViewToggle)는 스케일 prop
 * 없이 고정 Tailwind 값(w-[73px], h-[29px] 등)만 쓰므로, 이 줄 전체를
 * transform: scale()로 통째로 키우고 줄이는 기존 방식을 그대로 쓴다.
 * 다만 고정 영역은 스크롤 컨테이너 밖에서 flex 형제로 카테고리 영역과
 * 나란히 놓이므로, transform이 바꾸지 않는 레이아웃 폭을 실측해
 * 스케일된 폭만큼 직접 예약해 줘야 카테고리 스크롤 영역과 겹치거나
 * 벌어지지 않는다(useScaleFrame과 같은 원리, 폭 버전).
 *
 * 카테고리 스크롤 컨테이너도 마찬가지로 height를 TOOLBAR_HEIGHT * scale로
 * 직접 지정해야 한다 — transform은 페인트만 바꿀 뿐 레이아웃 박스 크기에는
 * 영향을 주지 않아서, height를 안 주면 컨테이너가 scale=1 기준 높이(29px)로
 * 고정된다. overflow-x-auto만 주고 overflow-y를 명시하지 않으면 스펙상
 * overflow-y가 auto로 계산되는데, scale이 1이 아닌 뷰포트에서는 시각적으로
 * 커지거나 작아진 칩이 이 고정 높이 박스에 잘리거나(위아래로 잘림) 반대로
 * 위/아래 요소와 겹쳐 보였다.
 */
function BusinessToolbar({
  selectedCategory,
  sortBy,
  viewMode,
  onSelectCategory,
  onSortChange,
  onToggleView,
}: BusinessToolbarProps) {
  const scale = useGlobalScale();
  const fixedInnerRef = useRef<HTMLDivElement>(null);
  const [fixedSize, setFixedSize] = useState<{ width: number; height: number }>();

  useLayoutEffect(() => {
    const inner = fixedInnerRef.current;
    if (!inner) return;

    const update = () =>
      setFixedSize({ width: inner.offsetWidth, height: inner.offsetHeight });

    update();

    const observer = new ResizeObserver(update);
    observer.observe(inner);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="flex items-center"
      style={{
        marginTop: TOOLBAR_MARGIN_TOP * scale,
        height: TOOLBAR_HEIGHT * scale,
        gap: TOOLBAR_GAP * scale,
      }}
    >
      <div
        className="shrink-0 overflow-hidden"
        style={{
          width: fixedSize ? fixedSize.width * scale : undefined,
          height: fixedSize ? fixedSize.height * scale : undefined,
        }}
      >
        <div
          ref={fixedInnerRef}
          className="flex w-max items-center"
          style={{
            gap: TOOLBAR_GAP,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <BusinessSortDropdown value={sortBy} onChange={onSortChange} />

          <BusinessViewToggle mode={viewMode} onToggle={onToggleView} />
        </div>
      </div>

      <div
        className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: TOOLBAR_HEIGHT * scale }}
      >
        <div
          className="flex w-max items-center"
          style={{
            gap: TOOLBAR_GAP,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <BusinessCategoryChips
            selectedCategory={selectedCategory}
            categories={businessCategories}
            onSelectCategory={onSelectCategory}
          />
        </div>
      </div>
    </div>
  );
}

export default BusinessToolbar;
