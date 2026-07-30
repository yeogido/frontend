import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RegionImageCarousel } from '../../components/common';
import { DEFAULT_REGION_CITY_ID } from '../../constants/regions';
import type { RegionCityId } from '../../constants/regions';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { buildLocalBusinessDetailPath } from '../../utils/routes';

import { BusinessGrid, BusinessList, BusinessToolbar } from './components';
import { regionImageOptions } from './constants';
import type { BusinessCategory, BusinessSort, BusinessViewMode } from './types';
import useLocalBusinesses from './hooks/useLocalBusinesses';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 21;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 17;
const CAROUSEL_MARGIN_TOP = 12;
const LIST_MARGIN_TOP = 16;
const GRID_GAP_X = 16;
const GRID_GAP_Y = 18;
const LIST_GAP = 16;

function LocalBusinessPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const [selectedCategory, setSelectedCategory] =
    useState<BusinessCategory>('전체');
  const [sortBy, setSortBy] = useState<BusinessSort>('추천순');
  const [viewMode, setViewMode] = useState<BusinessViewMode>('grid');
  const [selectedRegionId, setSelectedRegionId] = useState<RegionCityId>(
    DEFAULT_REGION_CITY_ID
  );

  const businesses = useLocalBusinesses({
    selectedCategory,
    sortBy,
  });

  const handleCardClick = (businessId: string) => {
    navigate(buildLocalBusinessDetailPath(businessId));
  };

  // TODO: BusinessItem.location이 자유 텍스트라 현재 필터링 불가.
  // location을 RegionCityId 기반으로 정규화하는 작업 필요 - 별도 이슈
  const handleSelectRegion = (region: { id: string }) => {
    setSelectedRegionId(region.id as RegionCityId);
  };

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          지역의 다양한 매력을 만나보세요
        </h1>

        <p
          className="text-gray-5 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          소상공인이 직접 소개하는 공간과 소식을 확인해 보세요
        </p>
      </div>

      <div style={{ marginTop: CAROUSEL_MARGIN_TOP * scale }}>
        <RegionImageCarousel
          options={regionImageOptions}
          selectedId={selectedRegionId}
          ariaLabel="지역 목록"
          onSelect={handleSelectRegion}
        />
      </div>

      <BusinessToolbar
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        viewMode={viewMode}
        onSelectCategory={setSelectedCategory}
        onSortChange={setSortBy}
        onToggleView={() =>
          setViewMode((current) => (current === 'grid' ? 'card' : 'grid'))
        }
      />

      <div style={{ marginTop: LIST_MARGIN_TOP * scale }}>
        {businesses.length === 0 ? (
          <p>조건에 맞는 소상공인이 없습니다.</p>
        ) : viewMode === 'grid' ? (
          <BusinessGrid
            businesses={businesses}
            onCardClick={handleCardClick}
            gapX={GRID_GAP_X * scale}
            gapY={GRID_GAP_Y * scale}
          />
        ) : (
          <BusinessList
            businesses={businesses}
            onCardClick={handleCardClick}
            gap={LIST_GAP * scale}
          />
        )}
      </div>
    </section>
  );
}

export default LocalBusinessPage;
