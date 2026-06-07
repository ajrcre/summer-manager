import Link from "next/link";
import { Lock, Unlock, Sun } from "lucide-react";
import { isEditor } from "@/lib/auth";

export async function Header() {
  const editor = await isEditor();
  return (
    <header className="sticky top-0 z-20 border-b border-violet-100 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-brand text-white">
            <Sun size={20} />
          </span>
          <span className="text-lg">מתכנן הקיץ</span>
        </Link>
        <Link
          href="/unlock"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            editor
              ? "bg-green-100 text-green-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          {editor ? <Unlock size={16} /> : <Lock size={16} />}
          {editor ? "מצב הורה" : "נעול"}
        </Link>
      </div>
    </header>
  );
}
