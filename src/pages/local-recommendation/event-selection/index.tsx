import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SelectionPageLayout from '../components/SelectionPageLayout';
import SelectionResultCard from '../components/SelectionResultCard';
import SelectedItemsSheet from '../components/SelectedItemsSheet';
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
    <>
      <SelectionPageLayout
        title={
          <>
            코스에
            <br />
            행사를 등록해 주세요
          </>
        }
        description="코스에 등록할 행사 및 페스티벌을 검색해 보세요"
        searchPlaceholder="행사명을 검색해 주세요"
        searchLabel="행사명 검색"
        searchSuggestions={festivalSearchSuggestions}
        items={searchResults}
        selectedItemIds={selectedFestivalIds}
        getItemId={(festival) => festival.id}
        onSearchChange={setQuery}
        onItemAdd={handleAddFestival}
        onBack={() =>
          navigate('/local-recommendation/tag-selection', { replace: true })
        }
        renderItem={(festival, isSelected, onItemAdd) => (
          <SelectionResultCard
            key={festival.id}
            item={festival}
            title={festival.title}
            description={festival.address}
            imageSrc={festival.imageSrc}
            imageAlt={`${festival.title} 행사 이미지`}
            action="add"
            disabled={isSelected}
            onItemAdd={onItemAdd}
          />
        )}
      />
      <SelectedItemsSheet
        selectedSectionTitle="추가된 행사"
        emptyMessage="아직 추가된 행사가 없어요"
        submitButtonLabel="행사 등록하기"
        selectedItems={selectedFestivals}
        isSubmitDisabled={selectedFestivals.length === 0}
        onItemRemove={handleRemoveFestival}
        onRemoveAll={handleRemoveAllFestivals}
        onSubmit={() => navigate('/local-recommendation/place-selection')}
        renderItem={(festival, onItemRemove) => (
          <SelectionResultCard
            key={festival.id}
            item={festival}
            title={festival.title}
            description={festival.address}
            imageSrc={festival.imageSrc}
            imageAlt={`${festival.title} 행사 이미지`}
            action="remove"
            onItemRemove={onItemRemove}
          />
        )}
      />
    </>
  );
}

export default EventSelectionPage;
