import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="text-6xl mb-4">🤷</div>
      <h1 className="font-jua text-3xl mb-2">여기는 아무것도 없어요!</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        찾으시는 페이지가 없습니다. 선생님한테 걸린 건 아니에요.
      </p>
      <Link
        href="/"
        className="text-white border-[3px] border-[var(--text)] rounded-[4px] px-8 py-3 font-jua text-lg inline-block"
        style={{ background: "var(--safe)" }}
      >
        메인으로 돌아가기 🏠
      </Link>
    </div>
  );
}
