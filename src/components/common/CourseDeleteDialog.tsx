import ConfirmDialog, { type ConfirmDialogProps } from './ConfirmDialog';

export type CourseDeleteDialogProps = Pick<
  ConfirmDialogProps,
  'isOpen' | 'isPending' | 'onCancel' | 'onConfirm'
>;

/** useCourseDelete()의 dialogProps를 그대로 받는, 코스 목록 화면 공용 삭제 확인 다이얼로그. */
function CourseDeleteDialog(props: CourseDeleteDialogProps) {
  return (
    <ConfirmDialog
      {...props}
      title="코스를 삭제할까요?"
      description="삭제한 코스는 되돌릴 수 없어요."
    />
  );
}

export default CourseDeleteDialog;
