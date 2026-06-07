import Link from "next/link";

type Props = {
  emoji: string;
  title: string;
  hint?: string;
  cta?: { href: string; label: string };
};

export function EmptyState({ emoji, title, hint, cta }: Props) {
  return (
    <div className="grid place-items-center rounded-3xl bg-white p-8 text-center shadow-sm">
      <span className="text-5xl">{emoji}</span>
      <p className="mt-3 text-lg font-bold text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 rounded-full bg-brand px-5 py-2 font-bold text-white"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
