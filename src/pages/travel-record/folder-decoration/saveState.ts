export const isTravelRecordEditorLocked = (isSaving: boolean) => isSaving;

let saveOwner: symbol | null = null;
const listeners = new Set<() => void>();

export const subscribeToTravelRecordSave = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const isTravelRecordSaving = () => saveOwner !== null;

export function acquireTravelRecordSave(): symbol | null {
  if (saveOwner) return null;
  saveOwner = Symbol('travel-record-save');
  listeners.forEach((listener) => listener());
  return saveOwner;
}

export function releaseTravelRecordSave(owner: symbol) {
  if (saveOwner !== owner) return;
  saveOwner = null;
  listeners.forEach((listener) => listener());
}

export async function clearPhotoDraftAfterTravelRecordSave(
  clearPhotoDraft: () => Promise<void>
) {
  try {
    await clearPhotoDraft();
    return true;
  } catch {
    return false;
  }
}
