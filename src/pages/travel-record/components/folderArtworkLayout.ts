/**
 * 여행 폴더 아트워크의 고정 치수와 사진 슬롯 배치.
 *
 * 실제 폴더 카드와 로딩 스켈레톤이 같은 값을 써야 두 모습이 어긋나지 않아
 * 한곳에 모아 둔다.
 */

export const FOLDER_ARTWORK_WIDTH = 159;
export const FOLDER_ARTWORK_HEIGHT = 183;

/** 폴더 앞면(사진을 덮는 반투명 판)의 위치와 크기. */
export const FOLDER_FRONT_TOP = 53;
export const FOLDER_FRONT_HEIGHT = 130;

/**
 * 폴더 아래 제목과 기간이 차지하는 높이. TravelFolderCard가 Tailwind 클래스로
 * 잡아 둔 값을 숫자로 옮긴 것이라, 카드 쪽을 고치면 여기도 같이 고쳐야 한다.
 *
 * - 제목: `mt-3` + `text-[16px] leading-none`
 * - 기간: `mt-1.5` + `text-[14px] leading-none` + `py-1`(위아래 4)
 */
export const FOLDER_TITLE_MARGIN_TOP = 12;
export const FOLDER_TITLE_HEIGHT = 16;
export const FOLDER_PERIOD_MARGIN_TOP = 6;
export const FOLDER_PERIOD_HEIGHT = 22;

/** 카드 한 장이 세로로 차지하는 길이. */
export const FOLDER_CARD_HEIGHT =
  FOLDER_ARTWORK_HEIGHT +
  FOLDER_TITLE_MARGIN_TOP +
  FOLDER_TITLE_HEIGHT +
  FOLDER_PERIOD_MARGIN_TOP +
  FOLDER_PERIOD_HEIGHT;

/** 목록 격자의 행 간격(`gap-y-[52px]`). */
export const FOLDER_GRID_ROW_GAP = 52;

export interface FolderPhotoSlot {
  wrapperClassName: string;
  frameClassName: string;
  cropClassName: string;
}

export const folderPhotoSlots: FolderPhotoSlot[] = [
  {
    wrapperClassName:
      'absolute top-0 left-[-3px] z-10 flex size-[104.373px] items-center justify-center',
    frameClassName:
      'flex size-[88px] -rotate-12 items-center justify-center overflow-hidden rounded-xl bg-[#f9f9f9] shadow-[2px_2px_2px_rgba(0,0,0,0.15)]',
    cropClassName:
      'absolute top-[calc(50%-0.19px)] left-[-12.19px] size-[104px] -translate-y-1/2',
  },
  {
    // 대표 사진이 놓이는 자리. 렌더 순서와 무관하게 왼쪽 사진 위로 겹치도록
    // z-index를 한 단계 높인다.
    wrapperClassName:
      'absolute top-[19px] left-[55px] z-11 flex size-[106.675px] items-center justify-center',
    frameClassName:
      'flex size-[88px] rotate-[14deg] items-center justify-center overflow-hidden rounded-xl bg-[#f9f9f9] shadow-[2px_2px_2px_rgba(0,0,0,0.15)]',
    cropClassName:
      'absolute top-[calc(50%-8px)] left-1/2 h-[110px] w-[83.008px] -translate-x-1/2 -translate-y-1/2',
  },
  {
    // 사진 한 장은 폴더 앞면 안쪽으로 더 들어간 전용 슬롯을 사용한다.
    wrapperClassName:
      'absolute top-[27px] left-[55px] z-11 flex size-[106.675px] items-center justify-center',
    frameClassName:
      'flex size-[88px] rotate-[14deg] items-center justify-center overflow-hidden rounded-xl bg-[#f9f9f9] shadow-[2px_2px_2px_rgba(0,0,0,0.15)]',
    cropClassName:
      'absolute top-[calc(50%-8px)] left-1/2 h-[110px] w-[83.008px] -translate-x-1/2 -translate-y-1/2',
  },
];

export const folderClipPathData =
  'M0.550781 116.349C1.42091 123.193 6.87674 128.611 13.752 129.456C6.73587 128.914 1.13324 123.343 0.550781 116.349ZM158.446 116.365C157.856 123.352 152.258 128.915 145.247 129.456C152.117 128.612 157.569 123.202 158.446 116.365ZM15.6328 1.42871H46.5322C51.4001 1.42871 55.9285 3.91111 58.5322 8.00586L59.1846 9.03223C61.9724 13.4168 66.8195 16.0732 72.0283 16.0732H143.367C151.213 16.0733 157.57 22.4087 157.57 30.2188V114.427C157.57 122.237 151.213 128.571 143.367 128.571H15.6328C7.7869 128.571 1.42981 122.237 1.42969 114.427V15.5732C1.42981 7.76327 7.7869 1.42882 15.6328 1.42871ZM150.59 16.8887C154.691 18.955 157.664 22.925 158.349 27.6357C157.546 22.9837 154.615 19.0578 150.59 16.8887ZM13.752 0.542969C6.87897 1.3879 1.42466 6.80318 0.551758 13.6445C1.13731 6.65346 6.73813 1.08516 13.752 0.542969Z';

export const folderClipPath = `path("${folderClipPathData}")`;
