import { create } from 'zustand';

import type { TravelRecordFolder } from '../pages/travel-record/types';

interface TravelRecordEditSession {
  id: string;
  source: 'mock' | 'saved';
  decorations: TravelRecordFolder['decorations'];
}

interface TravelRecordSessionState {
  deletedMockFolderIds: string[];
  editedMockFolders: Record<string, TravelRecordFolder>;
  editSession: TravelRecordEditSession | null;
  beginEdit: (session: TravelRecordEditSession) => void;
  clearEdit: () => void;
  saveMockFolder: (folder: TravelRecordFolder) => void;
  deleteMockFolder: (id: string) => void;
}

export const useTravelRecordSessionStore = create<TravelRecordSessionState>(
  (set) => ({
    deletedMockFolderIds: [],
    editedMockFolders: {},
    editSession: null,
    beginEdit: (session) => set({ editSession: session }),
    clearEdit: () => set({ editSession: null }),
    saveMockFolder: (folder) =>
      set((state) => ({
        editedMockFolders: { ...state.editedMockFolders, [folder.id]: folder },
        deletedMockFolderIds: state.deletedMockFolderIds.filter(
          (id) => id !== folder.id,
        ),
      })),
    deleteMockFolder: (id) =>
      set((state) => ({
        deletedMockFolderIds: [...new Set([...state.deletedMockFolderIds, id])],
      })),
  }),
);
