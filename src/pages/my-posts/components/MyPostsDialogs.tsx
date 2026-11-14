import {
  ConfirmDialog,
  ReviewDeleteDialog,
  ReviewDetailModal,
  ReviewEditModal,
} from '../../../components/common';
import type { useMyPostsPage } from '../hooks/useMyPostsPage';

interface MyPostsDialogsProps {
  readonly dialogs: ReturnType<typeof useMyPostsPage>['dialogs'];
}

/** 등록한 게시물 화면의 수정·삭제·상세 모달 묶음. 모바일과 데스크톱이 같이 쓴다. */
function MyPostsDialogs({ dialogs }: MyPostsDialogsProps) {
  const {
    editorProps,
    dialogProps,
    courseDeleteDialogProps,
    promotionDeleteDialogProps,
    openedReview,
    closeReview,
  } = dialogs;

  return (
    <>
      <ReviewEditModal key={editorProps.review?.id} {...editorProps} />
      <ReviewDeleteDialog {...dialogProps} />
      <ConfirmDialog
        {...courseDeleteDialogProps}
        title="코스를 삭제할까요?"
        description="삭제한 코스는 되돌릴 수 없어요."
      />
      <ConfirmDialog
        {...promotionDeleteDialogProps}
        title="홍보글을 삭제할까요?"
        description="삭제한 홍보글은 되돌릴 수 없어요."
      />
      {/*
        코스를 모르는 후기만 여기서 연다. 코스를 아는 후기는 코스 상세로
        넘어가 그쪽 모달이 뜬다.
      */}
      <ReviewDetailModal review={openedReview} onClose={closeReview} />
    </>
  );
}

export default MyPostsDialogs;
