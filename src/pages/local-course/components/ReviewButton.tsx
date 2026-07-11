function ReviewButton() {
  return (
    <div className="px-5 sm:px-6 lg:px-8">
      <button
        type="button"
        className="bg-main-5 h-[52px] w-full rounded-xl text-[16px] font-bold text-white active:scale-[0.99] lg:mx-auto lg:block lg:max-w-[1024px]"
      >
        리뷰 작성하기
      </button>
    </div>
  );
}

export default ReviewButton;
