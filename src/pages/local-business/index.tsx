import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BusinessGrid, BusinessList, BusinessToolbar } from './components';
import type { BusinessCategory, BusinessSort, BusinessViewMode } from './types';
import useLocalBusinesses from './hooks/useLocalBusinesses';

function LocalBusinessPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] =
    useState<BusinessCategory>('전체');
  const [sortBy, setSortBy] = useState<BusinessSort>('추천순');
  const [viewMode, setViewMode] = useState<BusinessViewMode>('grid');

  const businesses = useLocalBusinesses({
    selectedCategory,
    sortBy,
  });

  const handleCardClick = (businessId: string) => {
    navigate(`/local-business/detail/${businessId}`);
  };

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-4 pb-10">
      <div className="mb-3">
        <h1 className="text-[18px] font-semibold leading-none text-black">
          지역의 다양한 매력을 만나보세요
        </h1>

        <p className="mt-2 text-[12px] font-normal leading-none text-[#7F7F7F]">
          소상공인이 직접 소개하는 공간과 소식을 확인해 보세요
        </p>
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

      <div className="mt-4">
        {businesses.length === 0 ? (
          <p>조건에 맞는 소상공인이 없습니다.</p>
        ) : viewMode === 'grid' ? (
          <BusinessGrid businesses={businesses} onCardClick={handleCardClick} />
        ) : (
          <BusinessList businesses={businesses} onCardClick={handleCardClick} />
        )}
      </div>
    </section>
  );
}

export default LocalBusinessPage;
