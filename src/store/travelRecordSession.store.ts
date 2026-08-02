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
  /** 서버에 저장돼 있던 제목. 수정 화면에는 제목 입력이 없어 그대로 되돌려 보낸다. */
  title?: string;
  /** 서버에 저장돼 있던 지역 ID. 지역을 바꿨는지 판단하는 기준이다. */
  regionId?: number;
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
