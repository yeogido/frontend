import type { FestivalItem } from '../types';
import FestivalCard from './FestivalCard';

interface SelectedFestivalListProps {
  festivals: readonly FestivalItem[];
  onRemove: (festival: FestivalItem) => void;
}

function SelectedFestivalList({
  festivals,
  onRemove,
}: SelectedFestivalListProps) {
  if (festivals.length === 0) {
    return (
      <p className="text-gray-5 py-8 text-center text-base font-medium">
        아직 추가된 장소가 없어요
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {festivals.map((festival) => (
        <FestivalCard
          key={festival.id}
          festival={festival}
          action="remove"
          onAction={onRemove}
        />
      ))}
    </div>
  );
}

export default SelectedFestivalList;
