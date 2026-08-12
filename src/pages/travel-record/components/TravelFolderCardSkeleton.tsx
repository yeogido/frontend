import folderShadowLayerImage from '../assets/travel-folder-shadow-layer.svg';

import { FolderFrontFace } from './FolderFrontFace';
import {
  FOLDER_ARTWORK_HEIGHT,
  FOLDER_ARTWORK_WIDTH,
  FOLDER_PERIOD_HEIGHT,
  FOLDER_TITLE_HEIGHT,
  folderPhotoSlots,
} from './folderArtworkLayout';
import { getFolderPhotoSlotIndexes } from './folderPhotos';

const SKELETON_BLOCK_COLOR = '#EAEAEA';

// 폴더에 보이는 사진은 최대 두 장이라, 실제 카드가 두 장을 놓는 슬롯 순서를
// 그대로 가져와 자리만 회색으로 채운다.
const skeletonPhotoSlotIndexes = getFolderPhotoSlotIndexes(2);

// 높이는 실제 카드와 같아야 로딩이 끝나고 카드가 들어올 때 목록이 밀리지
// 않는다. 폭은 글자 수에 따라 달라지는 값이라 대표적인 길이로 둔다.
const TITLE_WIDTH = 72;
const PERIOD_WIDTH = 104;

/** 여행 폴더 카드가 로딩되는 동안 같은 자리·같은 크기로 놓이는 자리 표시. */
function TravelFolderCardSkeleton() {
  return (
    <div className="w-[159px] animate-pulse" aria-hidden="true">
      <div
        className="relative"
        style={{ width: FOLDER_ARTWORK_WIDTH, height: FOLDER_ARTWORK_HEIGHT }}
      >
        <img
          src={folderShadowLayerImage}
          alt=""
          className="pointer-events-none absolute top-[38px] left-[-10px] z-0 h-[160px] w-[179px]"
          aria-hidden="true"
        />

        {skeletonPhotoSlotIndexes.map((slotIndex) => {
          const slot = folderPhotoSlots[slotIndex];

          return (
            <div key={slotIndex} className={slot.wrapperClassName}>
              <div className={slot.frameClassName}>
                <div
                  className="size-20 rounded-xl"
                  style={{ backgroundColor: SKELETON_BLOCK_COLOR }}
                />
              </div>
            </div>
          );
        })}

        <FolderFrontFace />
      </div>

      <div className="flex flex-col items-center">
        <div
          className="mt-3 rounded"
          style={{
            width: TITLE_WIDTH,
            height: FOLDER_TITLE_HEIGHT,
            backgroundColor: SKELETON_BLOCK_COLOR,
          }}
        />
        <div
          className="mt-1.5 rounded-full"
          style={{
            width: PERIOD_WIDTH,
            height: FOLDER_PERIOD_HEIGHT,
            backgroundColor: SKELETON_BLOCK_COLOR,
          }}
        />
      </div>
    </div>
  );
}

export default TravelFolderCardSkeleton;
