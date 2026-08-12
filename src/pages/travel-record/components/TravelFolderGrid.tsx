import TravelFolderCard from './TravelFolderCard';

import type { TravelRecordFolder } from '../types';

interface TravelFolderGridProps {
  folders: TravelRecordFolder[];
  onFolderClick: (folder: TravelRecordFolder) => void;
  recentlySavedFolderId?: string | null;
}

const folderListLabel = '\uC5EC\uD589 \uD3F4\uB354 \uBAA9\uB85D';

function TravelFolderGrid({
  folders,
  onFolderClick,
  recentlySavedFolderId,
}: TravelFolderGridProps) {
  if (folders.length === 0) {
    return (
      <section
        aria-label={folderListLabel}
        className="mt-[142px] flex flex-col items-center text-center"
      >
        <p className="text-gray-4 text-[16px] leading-[22px] font-medium">
          {
            '\uC544\uC9C1 \uCD94\uAC00\uD55C \uC5EC\uD589 \uAE30\uB85D\uC774 \uC5C6\uC5B4\uC694'
          }
          <br />
          {
            '+ \uBC84\uD2BC\uC744 \uB20C\uB7EC \uC5EC\uD589 \uAE30\uB85D\uC744 \uCD94\uAC00\uD574 \uC8FC\uC138\uC694'
          }
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={folderListLabel}
      className="mt-7 grid grid-cols-2 gap-x-6 gap-y-[52px]"
    >
      {folders.map((folder) => (
        <TravelFolderCard
          key={folder.id}
          folder={folder}
          onClick={onFolderClick}
          isRecentlySaved={String(folder.id) === recentlySavedFolderId}
        />
      ))}
    </section>
  );
}

export default TravelFolderGrid;
