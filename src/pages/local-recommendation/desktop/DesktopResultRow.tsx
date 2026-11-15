import { IoAdd, IoClose } from 'react-icons/io5';

import PlaceMarkerIcon from '../components/PlaceMarkerIcon';

// Figma 1440 데스크톱 시안(6336:89225 / 6346:91192) 기준 리터럴 px
const PHOTO_SIZE = 68;
const ACTION_SIZE = 24;

interface DesktopResultRowProps {
  title: string;
  description: string;
  /** 'marker'면 사진 대신 위치 핀 아이콘을 쓴다 — 장소 검색 결과. */
  visual: 'photo' | 'marker';
  imageSrc?: string | null;
  disabled?: boolean;
  onAdd: () => void;
}

/** 좌측 검색 결과 한 줄 — 사진(또는 핀) + 이름/주소 + 추가 버튼. */
function DesktopResultRow({
  title,
  description,
  visual,
  imageSrc,
  disabled = false,
  onAdd,
}: DesktopResultRowProps) {
  return (
    <li className="flex min-w-0 items-center gap-[16px]">
      {visual === 'marker' ? (
        <PlaceMarkerIcon
          aria-hidden="true"
          className="mb-auto shrink-0"
          style={{ width: 16, height: 20, marginTop: 2 }}
        />
      ) : (
        <div
          className="bg-gray-2 shrink-0 overflow-hidden rounded-[12px]"
          style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
        >
          {imageSrc ? (
            <img src={imageSrc} alt="" className="size-full object-cover" />
          ) : null}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[20px] font-semibold text-black">
          {title}
        </h3>
        <p className="text-gray-5 mt-[6px] truncate text-[16px]">
          {description}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onAdd}
        aria-label={title + ' 추가'}
        className="text-gray-3 border-gray-2 flex shrink-0 items-center justify-center rounded-[6px] border bg-white disabled:cursor-default disabled:opacity-40"
        style={{ width: ACTION_SIZE, height: ACTION_SIZE }}
      >
        <IoAdd aria-hidden="true" className="text-[16px]" />
      </button>
    </li>
  );
}

export default DesktopResultRow;

interface DesktopSelectedRowProps {
  title: string;
  description: string;
  imageSrc?: string | null;
  onRemove: () => void;
}

/** 우측 "추가된 …" 패널의 한 줄 — 사진 + 이름/주소 + 삭제 버튼. */
export function DesktopSelectedRow({
  title,
  description,
  imageSrc,
  onRemove,
}: DesktopSelectedRowProps) {
  return (
    <li className="flex min-w-0 items-center gap-[12px] rounded-[12px] bg-white p-[12px]">
      <div className="bg-gray-2 size-[56px] shrink-0 overflow-hidden rounded-[12px]">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[16px] font-semibold text-black">
          {title}
        </h3>
        <p className="text-gray-5 mt-[4px] truncate text-[14px]">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={title + ' 삭제'}
        className="text-gray-3 border-gray-2 flex size-[24px] shrink-0 items-center justify-center rounded-[6px] border bg-white"
      >
        <IoClose aria-hidden="true" className="text-[16px]" />
      </button>
    </li>
  );
}
