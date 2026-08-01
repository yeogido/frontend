import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  TravelRecordFolder,
  TravelRecordServerPhoto,
} from '../pages/travel-record/types';

interface TravelRecordEditSession {
  id: string;
  decorations: TravelRecordFolder['decorations'];
  serverPhotos?: TravelRecordServerPhoto[];
}

interface TravelRecordSessionState {
  editSession: TravelRecordEditSession | null;
  beginEdit: (session: TravelRecordEditSession) => void;
  clearEdit: () => void;
}

export const useTravelRecordSessionStore = create<TravelRecordSessionState>()(
  persist((set) => ({
    editSession: null,
    beginEdit: (session) => set({ editSession: session }),
    clearEdit: () => set({ editSession: null }),
  }), {
    name: 'travel-record-edit-session',
    storage: createJSONStorage(() => sessionStorage),
    partialize: (state) => ({ editSession: state.editSession }),
  }),
);
