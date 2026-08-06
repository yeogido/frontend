import { BusinessCertificateUpload } from './BusinessCertificateUpload';
import { BusinessVerificationDateField } from './BusinessVerificationDateField';
import { BusinessVerificationField } from './BusinessVerificationField';

interface BusinessVerificationFormProps {
  readonly scale: number;
  readonly address: string;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly openedAt: string;
  readonly onCertificateChange: (certificate: File | null) => void;
  readonly onAddressChange: (value: string) => void;
  readonly onRepresentativeNameChange: (value: string) => void;
  readonly onRegistrationNumberChange: (value: string) => void;
  readonly onOpenedAtChange: (value: string) => void;
}

export function BusinessVerificationForm({
  scale,
  address,
  representativeName,
  registrationNumber,
  openedAt,
  onCertificateChange,
  onAddressChange,
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
      <BusinessVerificationField
        label="사업장 주소"
        value={address}
        placeholder="사업장 주소"
        scale={scale}
        onChange={onAddressChange}
        icon="search"
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
