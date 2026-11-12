import SelectionPageLayout from '../components/SelectionPageLayout';
import SelectionResultCard from '../components/SelectionResultCard';
import SelectedItemsSheet from '../components/SelectedItemsSheet';
import { getCourseDayLabel } from '../../../utils/courseDetail';
import { festivalSearchSuggestions } from './constants/festivalSearchSuggestions';
import { useEventSelection } from './useEventSelection';

function EventSelectionPage() {
  const {
    day,
    setQuery,
    searchResults,
    statusMessage,
    selectedFestivals,
    selectedFestivalIds,
    handleAddFestival,
    handleRemoveFestival,
    handleRemoveAllFestivals,
    goToPlaceSelection,
    handleSkip,
    handleBack,
  } = useEventSelection();

  return (
    <>
      <SelectionPageLayout
        title={
          <>
            {getCourseDayLabel(day)}에 방문할
            <br />
            행사를 등록해 주세요
          </>
        }
        description="코스에 등록할 행사 및 페스티벌을 검색해 보세요"
        searchPlaceholder="행사명을 검색해 주세요"
        searchLabel="행사명 검색"
        searchSuggestions={festivalSearchSuggestions}
        hideEmptySearchSuggestions
        items={searchResults}
        selectedItemIds={selectedFestivalIds}
        getItemId={(festival) => festival.id}
        onSearchChange={setQuery}
        onItemAdd={handleAddFestival}
        onBack={handleBack}
        statusMessage={
          statusMessage ? (
            <p className="text-gray-5 text-center text-sm font-medium">
              {statusMessage}
            </p>
          ) : undefined
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
        onSubmit={goToPlaceSelection}
        skipButtonLabel={
          selectedFestivals.length === 0 ? '건너뛰기' : undefined
        }
        onSkip={selectedFestivals.length === 0 ? handleSkip : undefined}
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
