import { getCourseDayLabel } from '../../../../utils/courseDetail';
import DesktopResultRow, {
  DesktopSelectedRow,
} from '../../desktop/DesktopResultRow';
import DesktopSearchField from '../../desktop/DesktopSearchField';
import DesktopSelectedPanel from '../../desktop/DesktopSelectedPanel';
import DesktopSelectionLayout from '../../desktop/DesktopSelectionLayout';
import { festivalSearchSuggestions } from '../constants/festivalSearchSuggestions';
import { useEventSelection } from '../useEventSelection';

/**
 * 행사 등록 — 데스크톱 뷰(Figma 6336:89225 / 6346:89446).
 *
 * 검색·선택·건너뛰기 흐름은 useEventSelection을 모바일과 같이 쓰고, 모바일에서
 * 아래에서 올라오던 선택 시트가 여기서는 오른쪽 패널이다.
 */
function EventSelectionDesktopPage() {
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
  } = useEventSelection();
  const hasSelected = selectedFestivals.length > 0;

  return (
    <DesktopSelectionLayout
      title={
        <>
          <span className="text-main-5">{getCourseDayLabel(day)}</span>에 방문할
          행사를 등록해 주세요
        </>
      }
      description="코스에 등록할 행사 및 페스티벌을 검색해 보세요"
      search={
        <DesktopSearchField
          placeholder="행사명을 검색해 주세요"
          label="행사명 검색"
          suggestions={festivalSearchSuggestions}
          onQueryChange={setQuery}
        />
      }
      statusMessage={
        statusMessage ? (
          <p className="text-gray-5 text-[16px] font-medium">{statusMessage}</p>
        ) : undefined
      }
      results={searchResults.map((festival) => (
        <DesktopResultRow
          key={festival.id}
          visual="photo"
          title={festival.title}
          description={festival.address}
          imageSrc={festival.imageSrc}
          disabled={selectedFestivalIds.has(festival.id)}
          onAdd={() => handleAddFestival(festival)}
        />
      ))}
      panel={
        <DesktopSelectedPanel
          title="추가된 행사"
          emptyMessage="아직 추가된 행사가 없어요"
          isEmpty={!hasSelected}
          onRemoveAll={handleRemoveAllFestivals}
          submitLabel="행사 등록하기"
          isSubmitDisabled={!hasSelected}
          onSubmit={goToPlaceSelection}
          skipLabel={hasSelected ? undefined : '건너뛰기'}
          onSkip={hasSelected ? undefined : handleSkip}
        >
          {selectedFestivals.map((festival) => (
            <DesktopSelectedRow
              key={festival.id}
              title={festival.title}
              description={festival.address}
              imageSrc={festival.imageSrc}
              onRemove={() => handleRemoveFestival(festival)}
            />
          ))}
        </DesktopSelectedPanel>
      }
    />
  );
}

export default EventSelectionDesktopPage;
