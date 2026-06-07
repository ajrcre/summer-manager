type Props = {
  percent: number; // 0..100
  size?: number;
  label?: string;
  sublabel?: string;
  color?: string;
};

/** Pure-CSS circular progress indicator (conic-gradient). */
export function ProgressRing({
  percent,
  size = 120,
  label,
  sublabel,
  color = "#7c3aed",
}: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${clamped}%, #ece9f5 ${clamped}%)`,
      }}
    >
      <div
        className="grid place-items-center rounded-full bg-white text-center"
        style={{ width: size - 18, height: size - 18 }}
      >
        <span className="text-2xl font-extrabold text-ink leading-none">
          {label ?? `${clamped}%`}
        </span>
        {sublabel && (
          <span className="mt-1 text-xs font-medium text-slate-400">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
