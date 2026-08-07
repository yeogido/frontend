import { useState } from 'react';

import { isBusinessVerificationSubmittable } from '../validation';

export function useBusinessVerificationForm() {
  const [certificate, setCertificate] = useState<File | null>(null);
  const [address, setAddress] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [openedAt, setOpenedAt] = useState('');

  const isSubmittable = isBusinessVerificationSubmittable({
    certificate,
    address,
    representativeName,
    registrationNumber,
    openedAt,
  });

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
