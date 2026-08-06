import ConfirmDialog from './ConfirmDialog';

export interface ReviewDeleteDialogProps {
  isOpen: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 후기 삭제 확인 다이얼로그.
 *
 * 후기 카드가 놓인 네 화면이 같은 문구를 쓰므로, 문구를 여기 한곳에만 둔다.
 * useReviewDelete가 돌려주는 dialogProps를 그대로 펼쳐 넣으면 된다.
 */
function ReviewDeleteDialog(props: ReviewDeleteDialogProps) {
  return (
    <ConfirmDialog
      {...props}
      title="후기를 삭제할까요?"
      description="삭제한 후기는 되돌릴 수 없어요."
    />
  );
}

export default ReviewDeleteDialog;
