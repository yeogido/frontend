import { IoAdd } from 'react-icons/io5';

import type { BusinessInfoResponse } from '../../../../types/business.type';
import { isBusinessPromoting } from '../../../../utils/businessPromotionStatus';

// Figma 1440 데스크톱 시안(7193:17595, 7193:45263) 기준 리터럴 px
const PHOTO_SIZE = 68;
const ACTION_SIZE = 24;

interface BusinessDesktopRowProps {
  readonly business: BusinessInfoResponse;
  /** 이미 고른 사업장이면 추가 버튼을 막는다. */
  readonly isSelected: boolean;
  readonly onAdd: (business: BusinessInfoResponse) => void;
}

/**
 * 사업장 목록의 한 줄. 이미 홍보 중인 사업장은 흐리게 하고 추가 버튼 자리에
 * "홍보중" 칩을 두며, 눌러도 선택되지 않는다. 사업장 응답에 사진이 없어서 사진
 * 자리는 회색 상자이고, 홍보 중이면 시안처럼 검은 50% 덮개를 씌운다.
 */
function BusinessDesktopRow({
  business,
  isSelected,
  onAdd,
}: BusinessDesktopRowProps) {
  const isPromoting = isBusinessPromoting(business);

  return (
    <li className="flex min-w-0 items-center gap-[24px]">
      <div
        className="bg-gray-2 relative shrink-0 overflow-hidden rounded-[12px]"
        style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
      >
        {isPromoting ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <h3
          className={`truncate font-semibold ${
            isPromoting ? 'text-gray-4 text-[16px]' : 'text-[18px] text-black'
          }`}
        >
          {business.businessName}
        </h3>
        <p
          className={`truncate ${
            isPromoting ? 'text-gray-3 text-[14px]' : 'text-gray-5 text-[16px]'
          }`}
        >
          {business.businessAddress}
        </p>
      </div>

      {isPromoting ? (
        <button
          type="button"
          aria-disabled="true"
          aria-label={`${business.businessName} 홍보중, 선택할 수 없어요`}
          onClick={(event) => event.preventDefault()}
          className="bg-gray-2 text-gray-4 shrink-0 cursor-default rounded-[8px] px-[8px] py-[6px] text-[12px] font-medium"
        >
          홍보중
        </button>
      ) : (
        <button
          type="button"
          disabled={isSelected}
          onClick={() => onAdd(business)}
          aria-label={`${business.businessName} 추가`}
          className="text-gray-3 border-gray-2 flex shrink-0 items-center justify-center rounded-[6px] border bg-white disabled:cursor-default disabled:opacity-40"
          style={{ width: ACTION_SIZE, height: ACTION_SIZE }}
        >
          <IoAdd aria-hidden="true" className="text-[16px]" />
        </button>
      )}
    </li>
  );
}

export default BusinessDesktopRow;
