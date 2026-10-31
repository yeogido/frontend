import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  mockSharedTravelRecordFolders,
  mockTravelRecordInvitations,
} from '../mocks/travelRecordInvitations';

import type {
  TravelRecordFolder,
  TravelRecordInvitation,
  TravelRecordServerPhoto,
  TravelRecordView,
} from '../pages/travel-record/types';

const isTravelRecordPreviewEnabled =
  import.meta.env.VITE_TRAVEL_RECORD_PREVIEW === 'true';

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
  /**
   * 목록 화면에서 마지막으로 보던 탭.
   *
   * 상세·작성 화면으로 나갔다 오면 목록 화면이 다시 마운트되는데, 그때마다
   * 폴더 탭으로 돌아가면 지도에서 고른 지역을 보고 온 사람이 매번 지도를
   * 다시 눌러야 한다.
   */
  listView: TravelRecordView;
  invitations: TravelRecordInvitation[];
  previewSharedFolders: TravelRecordFolder[];
  acceptInvitation: (invitation: TravelRecordInvitation) => void;
  declineInvitation: (invitationId: string) => void;
  beginEdit: (session: TravelRecordEditSession) => void;
  clearEdit: () => void;
  setListView: (view: TravelRecordView) => void;
}

export const useTravelRecordSessionStore = create<TravelRecordSessionState>()(
  persist((set) => ({
    editSession: null,
    listView: 'folder',
    // Preview data survives route remounts, but is excluded from persistence.
    invitations: isTravelRecordPreviewEnabled ? mockTravelRecordInvitations : [],
    previewSharedFolders: isTravelRecordPreviewEnabled
      ? mockSharedTravelRecordFolders
      : [],
    acceptInvitation: (invitation) => set((state) => ({
      invitations: state.invitations.filter((item) => item.id !== invitation.id),
      previewSharedFolders: [
        invitation.folder,
        ...state.previewSharedFolders.filter(
          (folder) => folder.id !== invitation.folder.id
        ),
      ],
    })),
    declineInvitation: (invitationId) => set((state) => ({
      invitations: state.invitations.filter((item) => item.id !== invitationId),
    })),
    beginEdit: (session) => set({ editSession: session }),
    clearEdit: () => set({ editSession: null }),
    setListView: (view) => set({ listView: view }),
  }), {
    name: 'travel-record-edit-session',
    storage: createJSONStorage(() => sessionStorage),
    partialize: (state) => ({
      editSession: state.editSession,
      listView: state.listView,
    }),
  }),
);
