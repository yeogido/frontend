import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { toBusinessProfile } from '../pages/business-verification/mappers/businessProfile';
import type {
  BusinessProfile,
  BusinessVerificationForm,
} from '../pages/business-verification/types';

interface BusinessVerificationState {
  readonly profile: BusinessProfile | null;
  completeVerification: (verification: BusinessVerificationForm) => void;
}

export const useBusinessVerificationStore = create<BusinessVerificationState>()(
  persist(
    (set) => ({
      profile: null,
      completeVerification: (verification) =>
        set({ profile: toBusinessProfile(verification) }),
    }),
    {
      name: 'business-verification-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
