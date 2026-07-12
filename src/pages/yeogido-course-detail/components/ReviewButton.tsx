function ReviewButton() {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 h-[72px] w-full max-w-[430px] -translate-x-1/2 bg-white px-5 pt-2 pb-3">
      <button
        type="button"
        className="bg-main-5 h-[52px] w-full rounded-xl text-[16px] font-bold text-white active:scale-[0.99]"
      >
        리뷰 작성하기
      </button>
    </div>
  );
}

export default ReviewButton;
