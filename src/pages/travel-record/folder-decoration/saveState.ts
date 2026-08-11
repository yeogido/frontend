export const isTravelRecordEditorLocked = (isSaving: boolean) => isSaving;

export async function clearPhotoDraftAfterTravelRecordSave(
  clearPhotoDraft: () => Promise<void>,
) {
  try {
    await clearPhotoDraft();
    return true;
  } catch {
    return false;
  }
}
