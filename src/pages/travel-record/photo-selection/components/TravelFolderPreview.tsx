import { TravelFolderArtwork } from '../../components';
import { getFolderPreviewPhotoUrls } from '../folderPreviewPhotos';
import type { SelectedPhoto } from '../types';

interface TravelFolderPreviewProps {
  photos: SelectedPhoto[];
  regionName: string;
}

const previewLabel = '여행 폴더 미리보기';

function TravelFolderPreview({ photos, regionName }: TravelFolderPreviewProps) {
  const [firstPhotoUrl, ...restPhotoUrls] = getFolderPreviewPhotoUrls(photos);

  if (!firstPhotoUrl) {
    return null;
  }

  return (
    <section
      aria-label={`${regionName} ${previewLabel}`}
      className="absolute top-[237px] left-1/2 flex w-[342px] -translate-x-1/2 flex-col items-center"
    >
      {/* 꾸미기는 다음 화면에서 하므로 스티커 없이 사진만 보여 준다. */}
      <TravelFolderArtwork
        photos={[firstPhotoUrl, ...restPhotoUrls]}
        title={regionName}
        decorations={[]}
      />
      <h2 className="mt-1.5 text-center text-[16px] leading-none font-medium text-[#1c1c1c]">
        {regionName}
      </h2>
    </section>
  );
}

export default TravelFolderPreview;
