import { useMemo, useState } from 'react';

import { SearchBar } from '../../../components/common';
import {
  DraggableBottomSheet,
  FestivalSearchResults,
  SelectedFestivalList,
} from './components';
import { referenceFestivalRecords } from './constants/referenceFestivals';
import type { FestivalItem } from './types';
import { filterFestivals } from './utils';

function EventSelectionPage() {
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

  return (
    <div className="bg-background min-h-dvh w-full">
      <main className="bg-white mx-auto min-h-dvh w-full max-w-[430px] px-6 pt-24 pb-[32dvh]">
        <h1 className="text-[30px] leading-[1.28] font-bold tracking-[-0.02em] text-black">
          코스에
          <br />
          행사를 등록해 주세요
        </h1>

        <p className="text-gray-5 mt-3 text-sm leading-5">
          코스에 등록할 행사 및 페스티벌을 검색해 보세요
        </p>

        <SearchBar
          className="mt-8 max-w-none"
          placeholder="행사명을 검색해 주세요"
          label="행사명 검색"
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

      <DraggableBottomSheet
        labelledBy="selected-festivals-title"
        header={
          <div className="flex items-center justify-between">
            <h2
              id="selected-festivals-title"
              className="text-base font-semibold text-black"
            >
              추가된 행사
            </h2>
            <button
              type="button"
              onClick={() => setSelectedFestivals([])}
              className="text-main-5 text-xs font-medium"
            >
              전체 삭제
            </button>
          </div>
        }
        footer={
          <button
            type="button"
            disabled={selectedFestivals.length === 0}
            className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 h-[53px] w-full rounded-xl text-lg font-semibold"
          >
            행사 등록하기
          </button>
        }
      >
        <SelectedFestivalList
          festivals={selectedFestivals}
          onRemove={handleRemoveFestival}
        />
      </DraggableBottomSheet>
    </div>
  );
}

export default EventSelectionPage;
