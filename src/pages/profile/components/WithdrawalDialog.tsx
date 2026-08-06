import ConfirmDialog from '../../../components/common/ConfirmDialog';

export function WithdrawalDialog({
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
      title="정말 탈퇴하시겠습니까?"
      description="탈퇴한 경우 회원의 기록(등록한 콘텐츠, 후기 글 작성 등)이 모두 삭제될 수 있습니다."
      confirmLabel="탈퇴하기"
      cancelLabel="취소"
      cancelClassName="bg-[#ff6f41] text-[#f9f9f9]"
      confirmClassName="bg-[#e4e4e4] text-[#505050]"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
