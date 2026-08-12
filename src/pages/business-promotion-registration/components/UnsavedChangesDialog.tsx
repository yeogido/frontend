import ConfirmDialog from '../../../components/common/ConfirmDialog';

// pages/profile/components/UnsavedChangesDialog.tsx와 같은 패턴(공용
// ConfirmDialog를 감싼 얇은 래퍼). ConfirmDialog 자체는 LoadingSpinner 등과
// 같은 진짜 전역 컴포넌트라 그대로 import해 쓰고, 이 래퍼만 "작성 중" 문맥에
// 맞는 문구로 새로 둔다 — "계속 수정"이 아니라 "계속 작성"이 자연스럽다.
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
      title="작성 중인 내용이 저장되지 않았습니다."
      description="저장하지 않고 나가시겠습니까?"
      confirmLabel="나가기"
      cancelLabel="계속 작성"
      cancelClassName="bg-[#ff6f41] text-[#f9f9f9]"
      confirmClassName="bg-[#e4e4e4] text-[#505050]"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
