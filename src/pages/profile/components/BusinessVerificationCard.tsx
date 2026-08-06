export function BusinessVerificationCard({ scale }: { scale: number }) {
  return (
    <section
      className="bg-main-5 w-full rounded-xl text-[#f9f9f9]"
      style={{ height: 134 * scale, padding: `${20 * scale}px` }}
    >
      <div className="flex flex-col" style={{ gap: 12 * scale }}>
        <div className="flex flex-col" style={{ gap: 2 * scale }}>
          <h2
            className="font-semibold"
            style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
          >
            소상공인 인증
          </h2>
          <p style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}>
            소상공인 인증을 완료하면
            <br />
            홍보 게시물을 등록할 수 있어요
          </p>
        </div>
        <button
          type="button"
          className="text-main-5 w-fit rounded-full bg-[#f9f9f9] font-semibold"
          style={{
            padding: `${8 * scale}px ${12 * scale}px`,
            fontSize: 14 * scale,
            lineHeight: `${16 * scale}px`,
          }}
        >
          소상공인 인증하기
        </button>
      </div>
    </section>
  );
}
