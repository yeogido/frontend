import TravelFolderCard from './TravelFolderCard';

import type { TravelRecordFolder } from '../types';

interface TravelFolderGridProps {
  folders: TravelRecordFolder[];
}

function TravelFolderGrid({ folders }: TravelFolderGridProps) {
  return (
    <section
      aria-label="여행 폴더 목록"
      className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7"
    >
      {folders.map((folder) => (
        <TravelFolderCard key={folder.id} folder={folder} />
      ))}
    </section>
  );
}

export default TravelFolderGrid;
