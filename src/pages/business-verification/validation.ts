interface BusinessVerificationValues {
  readonly certificate: File | null;
  readonly address: string;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly openedAt: string;
}

export function isBusinessRegistrationNumber(value: string) {
  return /^\d{3}-?\d{2}-?\d{5}$/.test(value.trim());
}

export function isBusinessVerificationSubmittable({
  certificate,
  address,
  representativeName,
  registrationNumber,
  openedAt,
}: BusinessVerificationValues) {
  return Boolean(
    certificate &&
      address.trim() &&
      representativeName.trim() &&
      isBusinessRegistrationNumber(registrationNumber) &&
      openedAt
  );
}
