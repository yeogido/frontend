export interface BusinessVerificationForm {
  readonly businessAddress: string;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly openedAt: string;
  readonly certificateName: string;
}

export interface BusinessProfile {
  readonly businessName: string;
  readonly businessAddress: string;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly openedAt: string;
}
