import ConfirmDialog, { type ConfirmDialogProps } from './ConfirmDialog';

export type FestivalDeleteDialogProps = Pick<
  ConfirmDialogProps,
  'isOpen' | 'isPending' | 'onCancel' | 'onConfirm'
>;

/** useContentDelete()의 dialogProps를 그대로 받는, 행사 목록 화면 공용 삭제 확인 다이얼로그. */
function FestivalDeleteDialog(props: FestivalDeleteDialogProps) {
  return (
    <ConfirmDialog
      {...props}
      title="행사를 삭제할까요?"
      description="삭제한 행사는 되돌릴 수 없어요."
    />
  );
}

export default FestivalDeleteDialog;
