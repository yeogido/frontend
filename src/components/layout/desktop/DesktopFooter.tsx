// 시안(6360:38447)의 푸터는 아직 내용이 없는 자리표시자다 — 높이와 색만
// 맞춰 두고, 실제 항목이 정해지면 이 안을 채운다.
const FOOTER_HEIGHT = 240;

function DesktopFooter() {
  return (
    <footer
      className="bg-gray-5 flex w-full items-center justify-center text-white"
      style={{ height: FOOTER_HEIGHT }}
    >
      <p className="text-[36px] font-bold">footer</p>
    </footer>
  );
}

export default DesktopFooter;
