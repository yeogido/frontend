import { useState } from 'react';

export function useBusinessVerificationForm() {
  const [certificate, setCertificate] = useState<File | null>(null);
  const [address, setAddress] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [openedAt, setOpenedAt] = useState('');

  const isSubmittable = Boolean(
    certificate &&
    address &&
    representativeName &&
    registrationNumber &&
    openedAt
  );

  return {
    certificate,
    address,
    representativeName,
    registrationNumber,
    openedAt,
    isSubmittable,
    setCertificate,
    setAddress,
    setRepresentativeName,
    setRegistrationNumber,
    setOpenedAt,
  };
}
