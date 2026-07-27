/**
 * 관리자 페이지 임시 틀.
 * 로그인/권한 기능이 구현되면 실제 접근 권한 체크와 실제 화면으로 교체 예정.
 */
function AdminPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-lg font-semibold text-[#1C1C1C]">
        관리자 페이지 (임시)
      </h1>

      <p className="text-sm text-[#7F7F7F]">
        아직 구현되지 않은 화면입니다. 로그인/권한 기능 구현 후 교체될
        예정입니다.
      </p>
    </div>
  );
}

export default AdminPage;