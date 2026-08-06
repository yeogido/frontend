import type { PlaceItem } from '../../local-recommendation/place-selection/types';
import { BusinessCertificateUpload } from './BusinessCertificateUpload';
import { BusinessPlaceSearchField } from './BusinessPlaceSearchField';
import { BusinessVerificationDateField } from './BusinessVerificationDateField';
import { BusinessVerificationField } from './BusinessVerificationField';

interface BusinessVerificationFormProps {
  readonly scale: number;
  readonly query: string;
  readonly searchResults: readonly PlaceItem[];
  readonly isSearching: boolean;
  readonly place: PlaceItem | null;
  readonly businessName: string;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly registrationNumberHint: string;
  readonly openedAt: string;
  readonly onCertificateChange: (certificate: File | null) => void;
  readonly onQueryChange: (value: string) => void;
  readonly onPlaceSelect: (place: PlaceItem) => void;
  readonly onPlaceClear: () => void;
  readonly onBusinessNameChange: (value: string) => void;
  readonly onRepresentativeNameChange: (value: string) => void;
  readonly onRegistrationNumberChange: (value: string) => void;
  readonly onOpenedAtChange: (value: string) => void;
}

export function BusinessVerificationForm({
  scale,
  query,
  searchResults,
  isSearching,
  place,
  businessName,
  representativeName,
  registrationNumber,
  registrationNumberHint,
  openedAt,
  onCertificateChange,
  onQueryChange,
  onPlaceSelect,
  onPlaceClear,
  onBusinessNameChange,
  onRepresentativeNameChange,
  onRegistrationNumberChange,
  onOpenedAtChange,
}: BusinessVerificationFormProps) {
  return (
    <section
      className="flex flex-col"
      style={{ marginTop: 32 * scale, gap: 24 * scale }}
    >
      <BusinessCertificateUpload scale={scale} onChange={onCertificateChange} />
      <BusinessPlaceSearchField
        scale={scale}
        query={query}
        results={searchResults}
        isLoading={isSearching}
        selectedPlace={place}
        onQueryChange={onQueryChange}
        onSelect={onPlaceSelect}
        onClear={onPlaceClear}
      />
      <BusinessVerificationField
        label="상호명"
        value={businessName}
        placeholder="사업자등록증상 상호명"
        scale={scale}
        onChange={onBusinessNameChange}
      />
      <BusinessVerificationField
        label="대표자 명"
        value={representativeName}
        placeholder="대표자 명"
        scale={scale}
        onChange={onRepresentativeNameChange}
      />
      <BusinessVerificationField
        label="사업자등록번호"
        value={registrationNumber}
        placeholder="예) 123-45-67890"
        scale={scale}
        onChange={onRegistrationNumberChange}
        hint={registrationNumberHint}
        inputMode="numeric"
        // 하이픈 2개까지 포함한 완성 형태의 길이
        maxLength={12}
      />
      <BusinessVerificationDateField
        label="개업일자"
        value={openedAt}
        placeholder="날짜"
        scale={scale}
        onChange={onOpenedAtChange}
      />
    </section>
  );
}
