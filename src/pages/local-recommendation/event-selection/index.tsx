import { useMemo, useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import { SearchBar } from '../../../components/common';
import { FestivalSearchResults, SelectedEventSheet } from './components';
import { referenceFestivalRecords } from './constants/referenceFestivals';
import type { FestivalItem } from './types';
import { filterFestivals } from './utils';

const festivalSearchSuggestions = referenceFestivalRecords
  .map(({ tag }) => tag)
  .slice(0, 3);

function EventSelectionPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedFestivals, setSelectedFestivals] = useState<FestivalItem[]>(
    []
  );

  const searchResults = useMemo(
    () => filterFestivals(referenceFestivalRecords, query),
    [query]
  );

  const selectedFestivalIds = useMemo(
    () => new Set(selectedFestivals.map((festival) => festival.id)),
    [selectedFestivals]
  );

  const handleAddFestival = (festival: FestivalItem) => {
    setSelectedFestivals((currentFestivals) =>
      currentFestivals.some((item) => item.id === festival.id)
        ? currentFestivals
        : [...currentFestivals, festival]
    );
  };

  const handleRemoveFestival = (festival: FestivalItem) => {
    setSelectedFestivals((currentFestivals) =>
      currentFestivals.filter((item) => item.id !== festival.id)
    );
  };

  const handleRemoveAllFestivals = () => {
    setSelectedFestivals([]);
  };

  return (
    <div className="bg-background min-h-dvh w-full">
      <main className="mx-auto min-h-dvh w-full max-w-[430px] bg-white px-6 pt-12 pb-[32dvh]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() =>
            navigate('/local-recommendation/tag-selection', { replace: true })
          }
          className="text-gray-5 mb-4 -ml-2 flex h-8 w-8 items-center justify-center"
        >
          <IoChevronBack aria-hidden="true" className="text-3xl" />
        </button>
        <h1 className="text-[30px] leading-[1.28] font-bold tracking-[-0.02em] text-black">
          코스에
          <br />
          행사를 등록해 주세요
        </h1>

        <p className="text-gray-5 mt-3 text-sm leading-5">
          코스에 등록할 행사 및 페스티벌을 검색해 보세요
        </p>

        <SearchBar
          className="mt-8 max-w-none [&:has(input:placeholder-shown)_[role=listbox]]:hidden"
          placeholder="행사명을 검색해 주세요"
          label="행사명 검색"
          suggestions={festivalSearchSuggestions}
          onSearch={setQuery}
        />

        <section className="mt-[22px]" aria-labelledby="festival-results-title">
          <h2
            id="festival-results-title"
            className="text-base leading-5 font-semibold text-black"
          >
            검색 결과
          </h2>

          <FestivalSearchResults
            festivals={searchResults}
            selectedFestivalIds={selectedFestivalIds}
            onAdd={handleAddFestival}
          />
        </section>
      </main>

      <SelectedEventSheet
        selectedEvents={selectedFestivals}
        onRemoveAll={handleRemoveAllFestivals}
        onRemove={handleRemoveFestival}
      />
    </div>
  );
}

export default EventSelectionPage;
