import { useState } from 'react';

import { usePlaceSearch } from '../../local-recommendation/place-selection/hooks/usePlaceSearch';
import type { PlaceItem } from '../../local-recommendation/place-selection/types';
import {
  formatBusinessNumberInput,
  getBusinessNumberHint,
  isBusinessVerificationSubmittable,
} from '../validation';

export function useBusinessVerificationForm() {
  const [certificate, setCertificate] = useState<File | null>(null);
  const [place, setPlace] = useState<PlaceItem | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [openedAt, setOpenedAt] = useState('');
  const { query, setQuery, searchResults, isLoading } = usePlaceSearch();

  // 사업장 주소는 직접 입력받지 않고 선택한 카카오 장소에서 끌어온다.
  // 도로명이 없는 장소가 있어 지번으로 폴백한다.
  const businessAddress = place
    ? place.roadAddress || place.lotAddress || place.address
    : '';

  const selectPlace = (nextPlace: PlaceItem) => {
    setPlace(nextPlace);
    // 상호명 기본값을 채워주되 이후 수정은 열어둔다. 카카오 장소명과 사업자
    // 등록상 상호명이 다른 경우가 있어서다.
    setBusinessName(nextPlace.title);
    setQuery('');
  };

  const clearPlace = () => {
    setPlace(null);
    setQuery('');
  };

  // 숫자만 쳐도 123-45-67890 형태가 되도록 입력을 받는 자리에서 정형화한다.
  const changeRegistrationNumber = (value: string) => {
    setRegistrationNumber(formatBusinessNumberInput(value));
  };

  const isSubmittable = isBusinessVerificationSubmittable({
    certificate,
    place,
    businessName,
    representativeName,
    registrationNumber,
    openedAt,
  });

  return {
    certificate,
    place,
    businessAddress,
    businessName,
    representativeName,
    registrationNumber,
    registrationNumberHint: getBusinessNumberHint(registrationNumber),
    openedAt,
    query,
    searchResults,
    isSearching: isLoading,
    isSubmittable,
    setCertificate,
    setQuery,
    selectPlace,
    clearPlace,
    setBusinessName,
    setRepresentativeName,
    setRegistrationNumber: changeRegistrationNumber,
    setOpenedAt,
  };
}
