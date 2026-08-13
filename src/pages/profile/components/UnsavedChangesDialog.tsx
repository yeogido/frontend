import ConfirmDialog from '../../../components/common/ConfirmDialog';

export function UnsavedChangesDialog({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="변경한 내용이 저장되지 않았습니다."
      description="저장하지 않고 나가시겠습니까?"
      confirmLabel="나가기"
      cancelLabel="계속 수정"
      cancelClassName="bg-[#ff6f41] text-[#f9f9f9]"
      confirmClassName="bg-[#e4e4e4] text-[#505050]"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
