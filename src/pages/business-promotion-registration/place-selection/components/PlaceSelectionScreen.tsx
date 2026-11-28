import { useEffect } from 'react';

import { useMyBusinesses } from '../../../../hooks/useMyBusinesses';
import type { BusinessInfoResponse } from '../../../../types/business.type';
import {
  areAllBusinessesPromoting,
  checkSelectedBusiness,
  isBusinessPromoting,
  type BusinessListStatus,
} from '../../../../utils/businessPromotionStatus';

import PlaceSelectionDesktopView from '../desktop';
import BusinessListSection from './BusinessListSection';
import SelectedBusinessSection from './SelectedBusinessSection';

interface PlaceSelectionScreenProps {
  desktop?: boolean;
  /**
   * 선택 상태를 이 컴포넌트가 직접 들고 있지 않고 상위(오케스트레이터)에서
   * 받는다 — 뒤로가기로 이 화면이 언마운트됐다가 다시 마운트돼도 이전에
   * 고른 사업장이 그대로 남아있게 하기 위해서다.
   */
  selectedBusiness: BusinessInfoResponse | null;
  onSelectedBusinessChange: (business: BusinessInfoResponse | null) => void;
  onNext: () => void | Promise<void>;
  onBack: () => void;
}

function PlaceSelectionScreen({
  desktop = false,
  selectedBusiness,
  onSelectedBusinessChange,
  onNext,
  onBack,
}: PlaceSelectionScreenProps) {
  const { data, isLoading, isError } = useMyBusinesses();

  const businesses = data ?? [];

  // useMyBusinesses는 userId===null이면 쿼리를 disabled로 꺼두는데, 이때도
  // isPending은 계속 true라 "불러오는 중..."이 영영 떠 있게 된다. isLoading
  // (isPending && isFetching)은 실제로 fetch가 진행 중일 때만 true라
  // disabled 상태와 진짜 로딩 중을 구분할 수 있다.
  //
  // 다중선택인 코스 등록과 달리 여기는 사업장 1개만 고른다 — 선택하면
  // 이전 선택을 그냥 덮어써서 언제나 최대 1개만 남는다.
  const statusMessage = isLoading
    ? '내 사업장을 불러오는 중이에요...'
    : isError
      ? '사업장 정보를 불러오지 못했어요.'
      : businesses.length === 0
        ? '사업자 인증이 완료된 사업장이 없어요. 사업자 인증을 먼저 진행해 주세요.'
        : undefined;

  // 인증한 사업장이 전부 홍보 중이면 고를 수 있는 사업장이 없다.
  const allPromoting = areAllBusinessesPromoting(businesses);
  // 이미 홍보 중인 사업장은 고르지 않는다(버튼도 막혀 있지만 여기서도 거른다).
  const handleSelect = (business: BusinessInfoResponse) => {
    if (isBusinessPromoting(business)) return;
    onSelectedBusinessChange(business);
  };

  // 고른 사업장을 최신 목록과 맞춘다. 목록이 정상일 때 그 사업장이 없거나 홍보
  // 중이면 선택을 해제해서, 목록에는 "홍보중" 칩이 보이고 시트는 선택 없음 상태가
  // 된다. 목록이 로딩 중이거나 에러면 해제하지 않고 넘어가지만 못하게 한다
  // (뒤로 갔다 와서 선택이 남아 있는 경우도 같다).
  const listStatus: BusinessListStatus = isError
    ? 'error'
    : data === undefined
      ? 'loading'
      : 'ready';
  const selectedCheck = checkSelectedBusiness({
    selectedBusinessId: selectedBusiness?.businessInfoId ?? null,
    listStatus,
    businesses,
  });

  useEffect(() => {
    if (selectedCheck === 'release') onSelectedBusinessChange(null);
  }, [selectedCheck, onSelectedBusinessChange]);

  const isSubmitBlocked =
    selectedBusiness !== null && selectedCheck !== 'selectable';

  const handleSubmit = () => {
    if (!selectedBusiness || isSubmitBlocked) return;
    void onNext();
  };

  if (desktop) {
    return (
      <PlaceSelectionDesktopView
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        statusMessage={statusMessage}
        allPromoting={allPromoting}
        isSubmitBlocked={isSubmitBlocked}
        onSelectedBusinessChange={onSelectedBusinessChange}
        onSelect={handleSelect}
        onSubmit={handleSubmit}
        onBack={onBack}
      />
    );
  }

  return (
    <>
      <BusinessListSection
        businesses={businesses}
        selectedBusinessId={
          selectedBusiness ? String(selectedBusiness.businessInfoId) : null
        }
        statusMessage={statusMessage}
        onItemAdd={handleSelect}
        onBack={onBack}
      />
      <SelectedBusinessSection
        selectedBusiness={selectedBusiness}
        allPromoting={allPromoting}
        isSubmitBlocked={isSubmitBlocked}
        onRemove={() => onSelectedBusinessChange(null)}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default PlaceSelectionScreen;
