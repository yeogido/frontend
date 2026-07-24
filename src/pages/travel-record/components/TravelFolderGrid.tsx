import TravelFolderCard from './TravelFolderCard';

import type { TravelRecordFolder } from '../types';

interface TravelFolderGridProps {
  folders: TravelRecordFolder[];
}

function TravelFolderGrid({ folders }: TravelFolderGridProps) {
  if (folders.length === 0) {
    return (
      <section
        aria-label="여행 폴더 목록"
        className="mt-[142px] flex flex-col items-center text-center"
      >
        <p className="text-[16px] leading-[22px] font-medium text-gray-4">
          아직 추가된 여행 기록이 없어요.
          <br />
          + 버튼을 눌러 여행 기록을 추가해 주세요.
        </p>
      </section>
    );
  }

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
